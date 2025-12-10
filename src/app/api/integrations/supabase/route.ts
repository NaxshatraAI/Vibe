import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const SUPABASE_OAUTH_CLIENT_ID = process.env.SUPABASE_OAUTH_CLIENT_ID;
const SUPABASE_OAUTH_REDIRECT_URI = process.env.SUPABASE_OAUTH_REDIRECT_URI;
const SUPABASE_OAUTH_URL = "https://api.supabase.com/v1/oauth/authorize";

/**
 * POST /api/integrations/supabase/start
 * 
 * Initiates the Supabase OAuth flow by redirecting the user to Supabase's authorization endpoint.
 * Uses authorization code flow (response_type=code).
 * Callback will be handled at /api/integrations/supabase/callback
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate required environment variables
    if (!SUPABASE_OAUTH_CLIENT_ID || !SUPABASE_OAUTH_REDIRECT_URI) {
      console.error("[Supabase OAuth] Missing required environment variables");
      return NextResponse.json(
        { error: "Supabase OAuth is not configured" },
        { status: 500 }
      );
    }

    // Construct the Supabase OAuth authorization URL
    const authUrl = new URL(SUPABASE_OAUTH_URL);
    authUrl.searchParams.set("client_id", SUPABASE_OAUTH_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", SUPABASE_OAUTH_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "offline_access"); // Request refresh token

    return NextResponse.json({
      success: true,
      message: "Supabase OAuth authorization URL generated",
      authUrl: authUrl.toString(),
      userId,
    });
  } catch (error) {
    console.error("[Supabase OAuth Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support GET requests to check connection status
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has connected their Supabase account
    const { prisma } = await import("@/lib/db");
    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: "SUPABASE",
        },
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    const isConnected = !!integration;
    const isExpired = integration?.expiresAt 
      ? new Date() > integration.expiresAt 
      : false;

    return NextResponse.json({
      success: true,
      isConnected,
      isExpired,
      needsReconnect: isExpired,
      connectedAt: integration?.createdAt,
    });
  } catch (error) {
    console.error("[Supabase Integration Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
