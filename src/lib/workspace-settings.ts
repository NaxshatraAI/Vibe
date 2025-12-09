import { cookies } from "next/headers";

/**
 * Utility to get the selected Supabase project ID from workspace settings (cookies)
 * This is used by the AI system to route database queries to the correct project
 */
export async function getSelectedSupabaseProjectId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const projectId = cookieStore.get("supabase_selected_project_id")?.value;
    return projectId || null;
  } catch (error) {
    console.error("[Workspace Settings] Failed to get selected Supabase project:", error);
    return null;
  }
}

/**
 * Utility to get the user ID associated with the selected Supabase project
 */
export async function getSelectedSupabaseProjectUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("supabase_selected_project_user_id")?.value;
    return userId || null;
  } catch (error) {
    console.error("[Workspace Settings] Failed to get Supabase project user ID:", error);
    return null;
  }
}

/**
 * Get both the project ID and user ID in one call
 */
export async function getSelectedSupabaseProject(): Promise<{
  projectId: string | null;
  userId: string | null;
}> {
  const [projectId, userId] = await Promise.all([
    getSelectedSupabaseProjectId(),
    getSelectedSupabaseProjectUserId(),
  ]);

  return { projectId, userId };
}
