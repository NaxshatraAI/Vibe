import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Check if user has connected their GitHub account
 */
export async function GET() {
  const session = await auth();
  const userId = (session as { userId?: string }).userId;
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        githubAccessToken: true,
        githubUsername: true,
        githubConnectedAt: true,
      },
    });

    const connected = !!user?.githubAccessToken;

    return NextResponse.json({
      connected,
      username: user?.githubUsername || null,
      connectedAt: user?.githubConnectedAt || null,
    });
  } catch (error) {
    console.error("[GitHub Status] Error:", error);
    return NextResponse.json({ 
      error: "Failed to check GitHub status" 
    }, { status: 500 });
  }
}
