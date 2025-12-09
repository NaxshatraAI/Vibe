import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SUPABASE_MANAGEMENT_API_URL = "https://api.supabase.com/v1";

interface SupabaseProject {
  id: string;
  name: string;
  region: string;
  created_at: string;
}

/**
 * GET /api/integrations/supabase/projects
 * Fetches all Supabase projects for the authenticated user using their stored access token.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: "SUPABASE",
        },
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Supabase integration not found. Please connect your Supabase account first." },
        { status: 404 }
      );
    }

    if (!integration.accessToken) {
      return NextResponse.json(
        { error: "Access token not found. Please reconnect your Supabase account." },
        { status: 401 }
      );
    }

    if (integration.expiresAt && new Date() > integration.expiresAt) {
      console.warn(`[Supabase] Access token expired for user ${userId}. Refresh token logic needed.`);
      return NextResponse.json(
        {
          error: "Access token expired. Please reconnect your Supabase account.",
          requiresReconnect: true,
        },
        { status: 401 }
      );
    }

    const projectsResponse = await fetch(`${SUPABASE_MANAGEMENT_API_URL}/projects`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${integration.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!projectsResponse.ok) {
      const errorData = await projectsResponse.text();
      console.error("[Supabase API Error]", projectsResponse.status, errorData);

      if (projectsResponse.status === 401) {
        return NextResponse.json(
          {
            error: "Invalid or expired access token. Please reconnect your Supabase account.",
            requiresReconnect: true,
          },
          { status: 401 }
        );
      }

      return NextResponse.json({ error: "Failed to fetch Supabase projects" }, { status: projectsResponse.status });
    }

    const projects: SupabaseProject[] = await projectsResponse.json();

    return NextResponse.json({ success: true, projects, count: projects.length });
  } catch (error) {
    console.error("[Supabase Projects Fetch Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
