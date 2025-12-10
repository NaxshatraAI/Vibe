import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SUPABASE_MANAGEMENT_API_URL = "https://api.supabase.com/v1";

interface CreateProjectRequest {
  name: string;
  region: string;
  dbPassword: string;
  organizationId?: string;
}

/**
 * POST /api/integrations/supabase/create-project
 * Creates a new Supabase project using the management API
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the integration for this user
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

    // Check if token is expired
    if (integration.expiresAt && new Date() > integration.expiresAt) {
      return NextResponse.json(
        {
          error: "Access token expired. Please reconnect your Supabase account.",
          requiresReconnect: true,
        },
        { status: 401 }
      );
    }

    // Parse request body
    let body: CreateProjectRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { name, region, dbPassword, organizationId } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    if (!region || typeof region !== "string") {
      return NextResponse.json({ error: "Region is required" }, { status: 400 });
    }

    if (!dbPassword || typeof dbPassword !== "string" || dbPassword.length < 6) {
      return NextResponse.json(
        { error: "Database password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Get organization ID from metadata if not provided
    let orgId = organizationId;
    if (!orgId && integration.metadata && typeof integration.metadata === "object") {
      const metadata = integration.metadata as { organizationId?: string };
      orgId = metadata.organizationId;
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID not found. Please reconnect your Supabase account." },
        { status: 400 }
      );
    }

    // Create project via Supabase API
    const createResponse = await fetch(`${SUPABASE_MANAGEMENT_API_URL}/projects`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integration.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        organization_id: orgId,
        region: region,
        db_pass: dbPassword,
        plan: "free", // Default to free tier
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.text();
      console.error("[Supabase Create Project Error]", createResponse.status, errorData);

      let errorMessage = "Failed to create Supabase project";
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // If not JSON, use status text
        errorMessage = createResponse.statusText || errorMessage;
      }

      if (createResponse.status === 401) {
        return NextResponse.json(
          {
            error: "Invalid or expired access token. Please reconnect your Supabase account.",
            requiresReconnect: true,
          },
          { status: 401 }
        );
      }

      return NextResponse.json({ error: errorMessage }, { status: createResponse.status });
    }

    const project = await createResponse.json();

    console.log(`[Supabase] User ${userId} created project: ${project.id} (${name})`);

    return NextResponse.json({
      success: true,
      message: "Project created successfully",
      project: {
        id: project.id,
        name: project.name,
        region: project.region,
        created_at: project.created_at,
      },
    });
  } catch (error) {
    console.error("[Supabase Create Project Error]", error);
    return NextResponse.json(
      { error: "Internal server error while creating project" },
      { status: 500 }
    );
  }
}
