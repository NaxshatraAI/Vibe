import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/integrations/supabase/select
 * Handles selection of a Supabase project by the user.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { projectId, projectName } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "projectId is required and must be a string" }, { status: 400 });
    }

    // Update the integration record with selected project info
    const integration = await prisma.integration.update({
      where: {
        userId_provider: {
          userId,
          provider: "SUPABASE",
        },
      },
      data: {
        selectedProjectId: projectId,
        selectedProjectName: projectName || null,
      },
    });

    // Set cookies for workspace settings
    const response = NextResponse.json({
      success: true,
      message: "Project selected successfully",
      projectId,
      projectName: integration.selectedProjectName,
      userId,
      selectedAt: new Date().toISOString(),
    });

    // Set cookies (they will be used for quick reference)
    response.cookies.set("supabase_selected_project_id", projectId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    response.cookies.set("supabase_selected_project_name", projectName || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    console.log(`[Supabase] User ${userId} selected project ${projectId} (${projectName})`);

    return response;
  } catch (error) {
    console.error("[Supabase Select Project Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
