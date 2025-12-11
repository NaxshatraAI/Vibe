import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/integrations/supabase/credentials
 * 
 * Returns client-safe Supabase credentials for use in generated apps/AI sandboxes.
 * ONLY returns:
 * - projectRef
 * - projectName  
 * - apiUrl
 * - anonKey
 * 
 * Service role key and DB URL are NEVER exposed to client.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: "SUPABASE",
        },
      },
      select: {
        selectedProjectId: true,
        selectedProjectName: true,
        supabaseProjectRef: true,
        supabaseApiUrl: true,
        supabaseAnonKey: true,
        // Explicitly NOT selecting service role or DB URL
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Supabase integration not connected" },
        { status: 404 }
      );
    }

    if (
      !integration.supabaseProjectRef ||
      !integration.supabaseApiUrl ||
      !integration.supabaseAnonKey
    ) {
      return NextResponse.json(
        {
          error: "Supabase project not fully configured",
          message: "Select or create a Supabase project first",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      projectRef: integration.supabaseProjectRef,
      projectName: integration.selectedProjectName,
      apiUrl: integration.supabaseApiUrl,
      anonKey: integration.supabaseAnonKey,
      message: "Use these credentials to configure your Supabase client",
    });
  } catch (error) {
    console.error("[Supabase Credentials Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
