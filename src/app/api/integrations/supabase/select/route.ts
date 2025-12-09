import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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

    const { projectId } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "projectId is required and must be a string" }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      message: "Project selected successfully",
      projectId,
      userId,
      selectedAt: new Date().toISOString(),
    });

    response.cookies.set({
      name: "supabase_selected_project_id",
      value: projectId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    response.cookies.set({
      name: "supabase_selected_project_user_id",
      value: userId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    console.log(`[Supabase] User ${userId} selected project ${projectId}`);

    return response;
  } catch (error) {
    console.error("[Supabase Select Project Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
