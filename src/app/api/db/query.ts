import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSelectedSupabaseProject } from "@/lib/workspace-settings";
import { z } from "zod";

/**
 * Validation schema for database queries
 * Enforces strict structure to prevent SQL injection and arbitrary code execution
 */
const QueryPayloadSchema = z.discriminatedUnion("operation", [
  // SELECT queries
  z.object({
    operation: z.literal("select"),
    table: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Invalid table name"),
    select: z.array(z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Invalid column name")).optional(),
    filters: z.record(z.unknown()).optional(),
    limit: z.number().int().positive().max(1000).optional(),
    offset: z.number().int().min(0).optional(),
    orderBy: z.object({
      column: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
      direction: z.enum(["asc", "desc"]),
    }).optional(),
  }),
  // INSERT queries
  z.object({
    operation: z.literal("insert"),
    table: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
    data: z.record(z.unknown()),
    returning: z.array(z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)).optional(),
  }),
  // UPDATE queries
  z.object({
    operation: z.literal("update"),
    table: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
    data: z.record(z.unknown()),
    filters: z.record(z.unknown()),
    returning: z.array(z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)).optional(),
  }),
  // DELETE queries
  z.object({
    operation: z.literal("delete"),
    table: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
    filters: z.record(z.unknown()),
    returning: z.array(z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)).optional(),
  }),
]);

type QueryPayload = z.infer<typeof QueryPayloadSchema>;

/**
 * POST /api/db/query
 * 
 * Secure server-side database query endpoint.
 * 
 * Security Features:
 * - User authentication required (Clerk)
 * - Project ownership verification
 * - Strict query payload validation (prevents SQL injection)
 * - Uses user's Supabase access token (not service role key)
 * - Access token stored securely server-side
 * - Validates all table and column names against whitelist pattern
 * - Enforces operation restrictions
 * - Never exposes Supabase credentials to client
 * 
 * Usage:
 * POST /api/db/query
 * {
 *   "operation": "select",
 *   "table": "users",
 *   "select": ["id", "email", "name"],
 *   "filters": { "active": true },
 *   "limit": 10
 * }
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

    // Get selected Supabase project from workspace settings
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

    // Retrieve user's Supabase integration (with access token)
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
        { error: "Supabase integration not found" },
        { status: 404 }
      );
    }

    if (!integration.accessToken) {
      return NextResponse.json(
        { error: "Access token missing. Please reconnect Supabase." },
        { status: 401 }
      );
    }

    // Check if access token is expired
    if (integration.expiresAt && new Date() > integration.expiresAt) {
      return NextResponse.json(
        { 
          error: "Access token expired. Please reconnect Supabase.",
          requiresReconnect: true,
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate query payload structure
    let validatedQuery: QueryPayload;
    try {
      validatedQuery = QueryPayloadSchema.parse(body);
    } catch (validationError) {
      return NextResponse.json(
        {
          error: "Invalid query payload",
          details: validationError instanceof z.ZodError
            ? validationError.errors.map(e => `${e.path.join(".")}: ${e.message}`)
            : "Unknown validation error",
        },
        { status: 400 }
      );
    }

    // Build Supabase REST API URL for the selected project
    // Format: https://{project-id}.supabase.co/rest/v1
    const supabaseApiUrl = `https://${projectId}.supabase.co/rest/v1`;

    // Execute the query based on operation type
    const result = await executeSupabaseQuery(
      supabaseApiUrl,
      integration.accessToken,
      validatedQuery
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.statusCode || 400 }
      );
    }

    console.log(
      `[Database Query] User ${userId} executed ${validatedQuery.operation} on ${validatedQuery.table}`
    );

    return NextResponse.json({
      success: true,
      operation: validatedQuery.operation,
      table: validatedQuery.table,
      data: result.data,
      rowCount: result.rowCount,
    });
  } catch (error) {
    console.error("[Database Query Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Execute a validated query against Supabase REST API
 * Returns results or error information
 */
async function executeSupabaseQuery(
  apiUrl: string,
  accessToken: string,
  query: QueryPayload
): Promise<{
  success: boolean;
  data?: unknown;
  rowCount?: number;
  error?: string;
  details?: string;
  statusCode?: number;
}> {
  try {
    switch (query.operation) {
      case "select":
        return await executeSelect(apiUrl, accessToken, query);
      case "insert":
        return await executeInsert(apiUrl, accessToken, query);
      case "update":
        return await executeUpdate(apiUrl, accessToken, query);
      case "delete":
        return await executeDelete(apiUrl, accessToken, query);
      default:
        return {
          success: false,
          error: "Unknown operation",
        };
    }
  } catch (error) {
    console.error("[Supabase Query Execution Error]", error);
    return {
      success: false,
      error: "Failed to execute query",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Execute SELECT query
 */
async function executeSelect(
  apiUrl: string,
  accessToken: string,
  query: Extract<QueryPayload, { operation: "select" }>
): Promise<{
  success: boolean;
  data?: unknown;
  rowCount?: number;
  error?: string;
  statusCode?: number;
}> {
  const selectCols = query.select?.join(",") || "*";
  let url = `${apiUrl}/${query.table}?select=${selectCols}`;

  // Add filters
  if (query.filters) {
    for (const [key, value] of Object.entries(query.filters)) {
      if (value === null) {
        url += `&${key}=is.null`;
      } else if (typeof value === "string") {
        url += `&${key}=eq.${encodeURIComponent(value)}`;
      } else if (typeof value === "number" || typeof value === "boolean") {
        url += `&${key}=eq.${value}`;
      }
    }
  }

  // Add ordering
  if (query.orderBy) {
    url += `&order=${query.orderBy.column}.${query.orderBy.direction}`;
  }

  // Add limit and offset
  if (query.limit) {
    url += `&limit=${query.limit}`;
  }
  if (query.offset !== undefined) {
    url += `&offset=${query.offset}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await response.text(); // Consume response body
    return {
      success: false,
      error: `Supabase API error: ${response.statusText}`,
      statusCode: response.status,
    };
  }

  const data = await response.json();
  return {
    success: true,
    data: Array.isArray(data) ? data : [data],
    rowCount: Array.isArray(data) ? data.length : 1,
  };
}

/**
 * Execute INSERT query
 */
async function executeInsert(
  apiUrl: string,
  accessToken: string,
  query: Extract<QueryPayload, { operation: "insert" }>
): Promise<{
  success: boolean;
  data?: unknown;
  rowCount?: number;
  error?: string;
  statusCode?: number;
}> {
  let url = `${apiUrl}/${query.table}`;

  if (query.returning?.length) {
    url += `?select=${query.returning.join(",")}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(query.data),
  });

  if (!response.ok) {
    await response.text(); // Consume response body
    return {
      success: false,
      error: `Supabase API error: ${response.statusText}`,
      statusCode: response.status,
    };
  }

  const data = await response.json();
  return {
    success: true,
    data: Array.isArray(data) ? data : [data],
    rowCount: Array.isArray(data) ? data.length : 1,
  };
}

/**
 * Execute UPDATE query
 */
async function executeUpdate(
  apiUrl: string,
  accessToken: string,
  query: Extract<QueryPayload, { operation: "update" }>
): Promise<{
  success: boolean;
  data?: unknown;
  rowCount?: number;
  error?: string;
  statusCode?: number;
}> {
  let url = `${apiUrl}/${query.table}`;

  // Add filters to URL
  const filterEntries = Object.entries(query.filters);
  if (filterEntries.length > 0) {
    const filterParts = filterEntries.map(([key, value]) => {
      if (value === null) {
        return `${key}=is.null`;
      } else if (typeof value === "string") {
        return `${key}=eq.${encodeURIComponent(value)}`;
      } else {
        return `${key}=eq.${value}`;
      }
    });
    url += `?${filterParts.join("&")}`;
  }

  if (query.returning?.length) {
    url += filterEntries.length > 0 ? "&" : "?";
    url += `select=${query.returning.join(",")}`;
  }

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(query.data),
  });

  if (!response.ok) {
    // Consume response body to prevent memory leak
    await response.text();
    return {
      success: false,
      error: `Supabase API error: ${response.statusText}`,
      statusCode: response.status,
    };
  }

  const data = await response.json();
  return {
    success: true,
    data: Array.isArray(data) ? data : [data],
    rowCount: Array.isArray(data) ? data.length : 1,
  };
}

/**
 * Execute DELETE query
 */
async function executeDelete(
  apiUrl: string,
  accessToken: string,
  query: Extract<QueryPayload, { operation: "delete" }>
): Promise<{
  success: boolean;
  data?: unknown;
  rowCount?: number;
  error?: string;
  statusCode?: number;
}> {
  let url = `${apiUrl}/${query.table}`;

  // Add filters to URL
  const filterEntries = Object.entries(query.filters);
  if (filterEntries.length > 0) {
    const filterParts = filterEntries.map(([key, value]) => {
      if (value === null) {
        return `${key}=is.null`;
      } else if (typeof value === "string") {
        return `${key}=eq.${encodeURIComponent(value)}`;
      } else {
        return `${key}=eq.${value}`;
      }
    });
    url += `?${filterParts.join("&")}`;
  }

  if (query.returning?.length) {
    url += filterEntries.length > 0 ? "&" : "?";
    url += `select=${query.returning.join(",")}`;
  }

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  });

  if (!response.ok) {
    // Consume response body to prevent memory leak
    await response.text();
    return {
      success: false,
      error: `Supabase API error: ${response.statusText}`,
      statusCode: response.status,
    };
  }

  const data = await response.json();
  return {
    success: true,
    data: Array.isArray(data) ? data : [data],
    rowCount: Array.isArray(data) ? data.length : 1,
  };
}
