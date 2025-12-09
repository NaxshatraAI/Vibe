import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Initiates GitHub OAuth flow
 * Redirects user to GitHub authorization page
 */
export async function GET() {
  const session = await auth();
  const userId = (session as { userId?: string }).userId;
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get GitHub OAuth credentials from environment
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/github/callback`;

  if (!clientId) {
    return NextResponse.json({ 
      error: "GitHub OAuth not configured",
      detail: "GITHUB_CLIENT_ID environment variable is missing" 
    }, { status: 500 });
  }

  // Build GitHub OAuth URL with required scopes
  const scopes = ["repo", "user"]; // repo: create/manage repos, user: get user info
  const state = userId; // Use userId as state for security verification
  
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", scopes.join(" "));
  githubAuthUrl.searchParams.set("state", state);

  return NextResponse.redirect(githubAuthUrl.toString());
}
