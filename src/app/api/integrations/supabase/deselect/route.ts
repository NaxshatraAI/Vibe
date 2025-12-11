import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/integrations/supabase/deselect
 * Handles deselection of a Supabase project by the user.
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clear the selected project info
    await prisma.integration.update({
      where: {
        userId_provider: {
          userId,
          provider: "SUPABASE",
        },
      },
      data: {
        selectedProjectId: null,
        selectedProjectName: null,
      },
    });

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: "Project deselected successfully",
      userId,
      deselectedAt: new Date().toISOString(),
    });

    response.cookies.delete("supabase_selected_project_id");
    response.cookies.delete("supabase_selected_project_name");

    console.log(`[Supabase] User ${userId} deselected project`);

    return response;
  } catch (error) {
    console.error("[Supabase Deselect Project Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
