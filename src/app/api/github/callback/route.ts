import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * GitHub OAuth callback handler
 * Exchanges authorization code for access token and stores it
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // This should be the userId
  
  const session = await auth();
  const userId = (session as { userId?: string }).userId;

  if (!userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=unauthorized`);
  }

  // Verify state matches userId for security
  if (state !== userId) {
    console.error("[GitHub OAuth] State mismatch:", { expected: userId, received: state });
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=invalid_state`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=no_code`);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/github/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=config_missing`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const accessToken = tokenData.access_token;

    // Get GitHub user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch GitHub user info");
    }

    const githubUser = await userResponse.json();

    // Store GitHub OAuth data in database
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        githubAccessToken: accessToken,
        githubRefreshToken: tokenData.refresh_token || null,
        githubId: String(githubUser.id),
        githubUsername: githubUser.login,
        githubConnectedAt: new Date(),
      },
      update: {
        githubAccessToken: accessToken,
        githubRefreshToken: tokenData.refresh_token || null,
        githubId: String(githubUser.id),
        githubUsername: githubUser.login,
        githubConnectedAt: new Date(),
      },
    });

    console.log(`[GitHub OAuth] Successfully connected GitHub account for user ${userId}:`, {
      githubUsername: githubUser.login,
      githubId: githubUser.id,
    });

    // Redirect back to home page with success message
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?github_connected=true`);
  } catch (error) {
    console.error("[GitHub OAuth] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=${encodeURIComponent(errorMessage)}`);
  }
}
