import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/integrations/supabase/diagnose
 * 
 * Diagnostic endpoint to check Supabase integration status and OAuth token validity.
 * Helps troubleshoot connection issues.
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
        id: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        accessToken: !!true, // Just check if it exists
        refreshToken: !!true,
        selectedProjectId: true,
        selectedProjectName: true,
        supabaseProjectRef: true,
        supabaseApiUrl: true,
        supabaseAnonKey: !!true,
        supabaseServiceRole: !!true,
      },
    });

    if (!integration) {
      return NextResponse.json({
        success: false,
        status: "not_connected",
        message: "No Supabase integration found",
      });
    }

    const isExpired = integration.expiresAt
      ? new Date() > integration.expiresAt
      : false;

    // Try to fetch projects with current token
    let tokenValid = false;
    let tokenErrorMsg = "";
    
    if (integration.accessToken) {
      try {
        const projectsResponse = await fetch("https://api.supabase.com/v1/projects", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${integration.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (projectsResponse.ok) {
          tokenValid = true;
        } else {
          tokenErrorMsg = `Supabase API returned ${projectsResponse.status}: ${projectsResponse.statusText}`;
        }
      } catch (error) {
        tokenErrorMsg = error instanceof Error ? error.message : String(error);
      }
    }

    return NextResponse.json({
      success: true,
      status: "connected",
      integration: {
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
        hasAccessToken: !!integration.accessToken,
        hasRefreshToken: !!integration.refreshToken,
        tokenExpired: isExpired,
        tokenExpiresAt: integration.expiresAt,
        selectedProject: {
          id: integration.selectedProjectId,
          name: integration.selectedProjectName,
          ref: integration.supabaseProjectRef,
        },
        hasCredentials: {
          apiUrl: !!integration.supabaseApiUrl,
          anonKey: !!integration.supabaseAnonKey,
          serviceRole: !!integration.supabaseServiceRole,
        },
      },
      tokenValidation: {
        valid: tokenValid,
        errorMessage: tokenErrorMsg,
      },
    });
  } catch (error) {
    console.error("[Supabase Diagnose Error]", error);
    return NextResponse.json(
      {
        error: "Diagnostic failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
