import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSelectedSupabaseProject } from "@/lib/workspace-settings";

interface SupabaseQueryRequest {
  operation: "query" | "insert" | "update" | "delete";
  table: string;
  data?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  // Additional SQL-like operations
  select?: string[];
  limit?: number;
  offset?: number;
}

function buildQueryParams(body: SupabaseQueryRequest) {
  const params = new URLSearchParams();

  if (body.select && body.select.length > 0) {
    params.set("select", body.select.join(","));
  }

  if (body.limit) params.set("limit", String(body.limit));
  if (body.offset) params.set("offset", String(body.offset));

  if (body.filters) {
    Object.entries(body.filters).forEach(([key, value]) => {
      // Default to equality filter; callers can extend as needed later
      params.set(key, `eq.${value}`);
    });
  }

  return params;
}

/**
 * POST /api/integrations/supabase/query
 * 
 * Server-side proxy for all Supabase database operations.
 * The AI system uses this route instead of directly accessing Supabase.
 * 
 * - Verifies user authentication
 * - Retrieves the selected Supabase project from workspace settings
 * - Routes the query to the appropriate Supabase project
 * - Returns results to the client
 * 
 * The AI must NEVER:
 * - Access Supabase service role keys directly
 * - Use Supabase client libraries in the sandbox
 * - Import environment variables for Supabase credentials
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - user not authenticated" },
        { status: 401 }
      );
    }

    // Get the workspace context
    const { projectId } = await getSelectedSupabaseProject();

    if (!projectId) {
      return NextResponse.json(
        {
          error: "No Supabase project selected",
          message: "Please select a Supabase project in workspace settings first",
        },
        { status: 400 }
      );
    }

    // Verify the selected project belongs to this user
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
        { error: "Supabase integration not found for user" },
        { status: 404 }
      );
    }

    if (!integration.accessToken) {
      return NextResponse.json(
        { error: "Access token expired or missing. Please reconnect Supabase." },
        { status: 401 }
      );
    }

    if (!integration.supabaseServiceRole || !integration.supabaseApiUrl) {
      return NextResponse.json(
        {
          error: "Supabase project credentials are missing. Re-select the project to refresh keys.",
        },
        { status: 400 }
      );
    }

    // Parse request body
    let body: SupabaseQueryRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.operation || !body.table) {
      return NextResponse.json(
        { error: "Missing required fields: operation, table" },
        { status: 400 }
      );
    }

    const baseUrl = `${integration.supabaseApiUrl}/rest/v1/${encodeURIComponent(body.table)}`;
    const headers: Record<string, string> = {
      apikey: integration.supabaseServiceRole,
      Authorization: `Bearer ${integration.supabaseServiceRole}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };

    const params = buildQueryParams(body);
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

    let supabaseResponse: Response;

    switch (body.operation) {
      case "query": {
        supabaseResponse = await fetch(url, { method: "GET", headers });
        break;
      }
      case "insert": {
        supabaseResponse = await fetch(baseUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(body.data ?? {}),
        });
        break;
      }
      case "update": {
        if (!body.filters || Object.keys(body.filters).length === 0) {
          return NextResponse.json(
            { error: "Update requires filters to avoid mass-updating" },
            { status: 400 }
          );
        }
        supabaseResponse = await fetch(url, {
          method: "PATCH",
          headers,
          body: JSON.stringify(body.data ?? {}),
        });
        break;
      }
      case "delete": {
        if (!body.filters || Object.keys(body.filters).length === 0) {
          return NextResponse.json(
            { error: "Delete requires filters to avoid mass-deleting" },
            { status: 400 }
          );
        }
        supabaseResponse = await fetch(url, { method: "DELETE", headers });
        break;
      }
      default: {
        return NextResponse.json(
          { error: `Unsupported operation: ${body.operation}` },
          { status: 400 }
        );
      }
    }

    const responseText = await supabaseResponse.text();
    let payload: unknown = responseText;
    try {
      payload = responseText ? JSON.parse(responseText) : null;
    } catch {
      // leave as text
    }

    if (!supabaseResponse.ok) {
      return NextResponse.json(
        {
          error: "Supabase request failed",
          status: supabaseResponse.status,
          details: payload,
        },
        { status: supabaseResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      operation: body.operation,
      table: body.table,
      projectId,
      data: payload,
    });
  } catch (error) {
    console.error("[Supabase Query Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
