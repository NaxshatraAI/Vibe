import { auth } from "@clerk/nextjs/server";
import { prisma } from "./db";

/**
 * Utility to get the selected Supabase project ID from the database
 * This is used by the AI system to route database queries to the correct project
 */
export async function getSelectedSupabaseProjectId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: "SUPABASE",
        },
      },
    });

    return integration?.selectedProjectId || null;
  } catch (error) {
    console.error("[Workspace Settings] Failed to get selected Supabase project:", error);
    return null;
  }
}

/**
 * Utility to get the selected Supabase project name
 */
export async function getSelectedSupabaseProjectName(): Promise<string | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: "SUPABASE",
        },
      },
    });

    return integration?.selectedProjectName || null;
  } catch (error) {
    console.error("[Workspace Settings] Failed to get Supabase project name:", error);
    return null;
  }
}

/**
 * Get both the project ID and name in one call
 */
export async function getSelectedSupabaseProject(): Promise<{
  projectId: string | null;
  projectName: string | null;
}> {
  const [projectId, projectName] = await Promise.all([
    getSelectedSupabaseProjectId(),
    getSelectedSupabaseProjectName(),
  ]);

  return { projectId, projectName };
}
