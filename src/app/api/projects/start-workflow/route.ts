import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { consumeCredits } from "@/lib/usage";
import { inngest } from "@/inngest/client";

/**
 * Start the code-agent workflow for a project without requiring GitHub
 * This allows users to generate code and then optionally push to GitHub later
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session as { userId?: string }).userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { projectId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectId } = body;
  
  if (!projectId) {
    return NextResponse.json({ 
      error: "projectId is required" 
    }, { status: 400 });
  }

  // Verify project ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId },
  });

  if (!project) {
    return NextResponse.json({ 
      error: "Project not found or forbidden" 
    }, { status: 403 });
  }

  try {
    // Fetch the first user message (prompt) for this project
    const firstMessage = await prisma.message.findFirst({
      where: { projectId, role: "USER" },
      orderBy: { createdAt: "asc" },
      select: { content: true },
    });

    if (!firstMessage) {
      return NextResponse.json({
        error: "No prompt found for project",
        detail: "Cannot start workflow without an initial user prompt",
      }, { status: 500 });
    }

    // Consume credits before starting the workflow
    try {
      await consumeCredits();
    } catch {
      return NextResponse.json({
        error: "Insufficient credits",
        detail: "Please upgrade or wait for credits to reset before starting the build.",
      }, { status: 429 });
    }

    // Kick off the background code-agent workflow
    await inngest.send({
      name: "code-agent/run",
      data: {
        value: firstMessage.content,
        projectId,
      },
    });

    console.log(`[Project Workflow] Started workflow for project: ${projectId}`);

    return NextResponse.json({
      success: true,
      workflowStarted: true,
      message: "Code generation workflow started successfully",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(`[Project Workflow Error]`, message);
    return NextResponse.json({ 
      error: "Failed to start workflow", 
      detail: message 
    }, { status: 500 });
  }
}
