import { prisma } from "./db";

const SUPABASE_MANAGEMENT_API_URL = "https://api.supabase.com/v1";

interface SupabaseApiKey {
  name?: string;
  api_key?: string;
  key?: string;
  token?: string;
}

export interface SupabaseProjectCredentials {
  projectRef: string;
  apiUrl: string;
  anonKey: string | null;
  serviceRoleKey: string | null;
  dbUrl: string | null;
}

function extractKeyValue(entry: SupabaseApiKey | undefined): string | null {
  if (!entry) return null;
  return entry.api_key || entry.key || entry.token || null;
}

/**
 * Fetch anon/service role keys (and attempt DB URL) for a Supabase project.
 */
export async function fetchSupabaseProjectCredentials(
  accessToken: string,
  projectRef: string
): Promise<SupabaseProjectCredentials> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  // Keys
  const keysResponse = await fetch(
    `${SUPABASE_MANAGEMENT_API_URL}/projects/${projectRef}/api-keys`,
    { headers }
  );

  if (!keysResponse.ok) {
    const body = await keysResponse.text();
    console.error(`[Supabase Management] Failed to fetch API keys for project ${projectRef}:`, {
      status: keysResponse.status,
      statusText: keysResponse.statusText,
      body: body.substring(0, 500), // Log first 500 chars
    });
    throw new Error(
      `Failed to fetch Supabase API keys (${keysResponse.status}): ${body}`
    );
  }

  const keys: SupabaseApiKey[] = await keysResponse.json();
  const anonKey = extractKeyValue(
    keys.find((k) => (k.name || "").toLowerCase().includes("anon"))
  );
  const serviceRoleKey = extractKeyValue(
    keys.find((k) => (k.name || "").toLowerCase().includes("service"))
  );

  // DB connection string (best-effort; not all tokens/orgs may allow this)
  let dbUrl: string | null = null;
  try {
    const dbResponse = await fetch(
      `${SUPABASE_MANAGEMENT_API_URL}/projects/${projectRef}/db-connection-string`,
      { headers }
    );

    if (dbResponse.ok) {
      const payload = await dbResponse.json();
      dbUrl = payload.connection_string || payload.connectionString || null;
    } else {
      console.warn(
        `[Supabase] Could not fetch DB connection string for ${projectRef}: ${dbResponse.status}`
      );
    }
  } catch (error) {
    console.warn(
      `[Supabase] Error fetching DB connection string for ${projectRef}:`,
      error
    );
  }

  return {
    projectRef,
    apiUrl: `https://${projectRef}.supabase.co`,
    anonKey: anonKey || null,
    serviceRoleKey: serviceRoleKey || null,
    dbUrl,
  };
}

interface UpsertArgs {
  userId: string;
  projectRef: string;
  projectName?: string | null;
  accessToken: string;
}

/**
 * Fetch credentials and persist them (including selection metadata) on the Integration row.
 */
export async function upsertSupabaseCredentialsForUser({
  userId,
  projectRef,
  projectName,
  accessToken,
}: UpsertArgs) {
  const creds = await fetchSupabaseProjectCredentials(accessToken, projectRef);

  return prisma.integration.update({
    where: {
      userId_provider: {
        userId,
        provider: "SUPABASE",
      },
    },
    data: {
      selectedProjectId: projectRef,
      selectedProjectName: projectName || null,
      supabaseProjectRef: projectRef,
      supabaseApiUrl: creds.apiUrl,
      supabaseAnonKey: creds.anonKey,
      supabaseServiceRole: creds.serviceRoleKey,
      supabaseDbUrl: creds.dbUrl,
      updatedAt: new Date(),
    },
  });
}
