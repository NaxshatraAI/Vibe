import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SUPABASE_OAUTH_CLIENT_ID = process.env.SUPABASE_OAUTH_CLIENT_ID;
const SUPABASE_OAUTH_CLIENT_SECRET = process.env.SUPABASE_OAUTH_CLIENT_SECRET;
const SUPABASE_OAUTH_REDIRECT_URI = process.env.SUPABASE_OAUTH_REDIRECT_URI;
const SUPABASE_OAUTH_TOKEN_URL = "https://api.supabase.com/v1/oauth/token";

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

/**
 * GET /api/integrations/supabase/callback
 * 
 * Handles the OAuth callback from Supabase.
 * - Reads the authorization code from URL parameters
 * - Exchanges the code for access_token and refresh_token
 * - Stores tokens securely in the database
 * - Redirects user back to dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Get the authorization code from query parameters
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors from Supabase
    if (error) {
      console.error("[Supabase OAuth Error]", error, errorDescription);
      const redirectUrl = new URL(
        `/?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || "")}`,
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    if (!code) {
      console.error("[Supabase OAuth] No authorization code received");
      const redirectUrl = new URL(
        "/?error=no_code&error_description=No authorization code received",
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Validate required environment variables
    if (!SUPABASE_OAUTH_CLIENT_ID || !SUPABASE_OAUTH_CLIENT_SECRET || !SUPABASE_OAUTH_REDIRECT_URI) {
      console.error("[Supabase OAuth] Missing required environment variables");
      const redirectUrl = new URL(
        "/?error=server_error&error_description=OAuth is not configured",
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch(SUPABASE_OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: SUPABASE_OAUTH_CLIENT_ID,
        client_secret: SUPABASE_OAUTH_CLIENT_SECRET,
        redirect_uri: SUPABASE_OAUTH_REDIRECT_URI,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error(
        "[Supabase Token Exchange Error]",
        tokenResponse.status,
        errorData
      );
      const redirectUrl = new URL(
        "/?error=token_exchange_failed&error_description=Failed to exchange code for tokens",
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    const tokens: TokenResponse = await tokenResponse.json();

    if (!tokens.access_token) {
      console.error("[Supabase Token Response] No access token received");
      const redirectUrl = new URL(
        "/?error=no_access_token&error_description=No access token received",
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Calculate expiration time if provided
    let expiresAt = null;
    if (tokens.expires_in) {
      expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    }

    // Save or update the integration in the database
    await prisma.integration.upsert({
      where: {
        userId_provider: {
          userId,
          provider: "SUPABASE",
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiresAt,
        updatedAt: new Date(),
      },
      create: {
        userId,
        provider: "SUPABASE",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiresAt,
      },
    });

    console.log(
      `[Supabase Integration] Successfully saved tokens for user ${userId}`
    );

    // Redirect to projects/dashboard with success message
    return NextResponse.redirect(
      new URL("/?integration=supabase&status=connected", request.url)
    );
  } catch (error) {
    console.error("[Supabase Callback Error]", error);
    const redirectUrl = new URL(
      "/?error=internal_error&error_description=An internal error occurred",
      request.url
    );
    return NextResponse.redirect(redirectUrl);
  }
}
