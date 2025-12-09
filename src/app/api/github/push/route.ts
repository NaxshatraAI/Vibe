import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Push code to GitHub repository
 * Commits and pushes all files from the latest fragment to the project's GitHub repo
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session as { userId?: string }).userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { projectId?: string; githubToken?: string; commitMessage?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectId, commitMessage = "Update from Vibe" } = body;
  let { githubToken } = body as { githubToken?: string };
  
  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  // If token not provided, try to fetch from Clerk private metadata
  if (!githubToken) {
    try {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const pm = user.privateMetadata as Record<string, unknown> | null | undefined;
  const storedToken = pm && typeof pm.githubToken === "string" ? (pm.githubToken as string) : undefined;
      if (storedToken) {
        githubToken = storedToken;
      }
    } catch (metaErr) {
      console.warn("[GitHub Push] Failed to read token from Clerk private metadata", metaErr);
    }
  }

  if (!githubToken) {
    return NextResponse.json({ 
      error: "GitHub token not found",
      detail: "Please connect GitHub once to store your token, or include 'githubToken' in the request body.",
    }, { status: 400 });
  }

  // Verify project ownership and GitHub setup
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId },
  });

  if (!project) {
    return NextResponse.json({ 
      error: "Project not found or forbidden" 
    }, { status: 403 });
  }

  if (!project.githubEnabled || !project.githubRepoName) {
    return NextResponse.json({ 
      error: "GitHub not enabled for this project" 
    }, { status: 400 });
  }

  // Get latest fragment files
  const latest = await prisma.message.findFirst({
    where: { projectId, type: "RESULT", role: "ASSISTANT" },
    orderBy: { createdAt: "desc" },
    include: { fragment: true },
  });

  if (!latest?.fragment?.files) {
    return NextResponse.json({ 
      error: "No files to push" 
    }, { status: 404 });
  }

  const files = latest.fragment.files as Record<string, string>;

  try {
    // Get authenticated user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ 
        error: "Invalid GitHub token" 
      }, { status: 401 });
    }

    const userData = await userResponse.json();
    const owner = userData.login;

    console.log(`[GitHub Push] Attempting to access repository: ${owner}/${project.githubRepoName}`);

    // Get the default branch (usually 'main' or 'master')
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${project.githubRepoName}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!repoResponse.ok) {
      const errorData = await repoResponse.json().catch(() => ({}));
      console.error(`[GitHub Push] Repository not found:`, {
        owner,
        repoName: project.githubRepoName,
        status: repoResponse.status,
        error: errorData
      });
      
      return NextResponse.json({ 
        error: "Repository not found",
        detail: `Could not find repository '${owner}/${project.githubRepoName}'. Please verify:\n1. The repository name doesn't contain invalid characters like @ or spaces\n2. The repository exists in your GitHub account\n3. Your token has access to this repository\n\nIf you just created the repo, wait 5-10 seconds and try again.`,
        repoName: project.githubRepoName,
        owner: owner
      }, { status: 404 });
    }

    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch;

    // Get the latest commit SHA
    const refResponse = await fetch(
      `https://api.github.com/repos/${owner}/${project.githubRepoName}/git/refs/heads/${defaultBranch}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!refResponse.ok) {
      return NextResponse.json({ 
        error: "Failed to get branch reference" 
      }, { status: 500 });
    }

    const refData = await refResponse.json();
    const latestCommitSha = refData.object.sha;

    // Get the tree SHA from the latest commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${project.githubRepoName}/git/commits/${latestCommitSha}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const commitData = await commitResponse.json();
    const baseTreeSha = commitData.tree.sha;

    // Create blobs for each file
    const tree = await Promise.all(
      Object.entries(files).map(async ([path, content]) => {
        const blobResponse = await fetch(
          `https://api.github.com/repos/${owner}/${project.githubRepoName}/git/blobs`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${githubToken}`,
              "Content-Type": "application/json",
              Accept: "application/vnd.github+json",
            },
            body: JSON.stringify({
              content,
              encoding: "utf-8",
            }),
          }
        );

        const blobData = await blobResponse.json();
        return {
          path,
          mode: "100644" as const,
          type: "blob" as const,
          sha: blobData.sha,
        };
      })
    );

    // Create a new tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${project.githubRepoName}/git/trees`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree,
        }),
      }
    );

    const treeData = await treeResponse.json();

    // Create a new commit
    const newCommitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${project.githubRepoName}/git/commits`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: commitMessage,
          tree: treeData.sha,
          parents: [latestCommitSha],
          author: {
            name: "Trikon",
            email: "bot@trikon.dev",
          },
          committer: {
            name: "Trikon",
            email: "bot@trikon.dev",
          },
        }),
      }
    );

    const newCommitData = await newCommitResponse.json();

    // Update the reference
    const updateRefResponse = await fetch(
      `https://api.github.com/repos/${owner}/${project.githubRepoName}/git/refs/heads/${defaultBranch}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          sha: newCommitData.sha,
        }),
      }
    );

    if (!updateRefResponse.ok) {
      return NextResponse.json({ 
        error: "Failed to push commit" 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      commitSha: newCommitData.sha,
      repoUrl: project.githubRepoUrl,
      filesCount: Object.keys(files).length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ 
      error: "Failed to push to GitHub", 
      detail: message 
    }, { status: 500 });
  }
}
