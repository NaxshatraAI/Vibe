import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';
import { getProjectFilesForReview } from '@/modules/reviews/server/utils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface FileContent {
  path: string;
  content: string;
  language?: string;
}

interface IssueData {
  type: 'SECURITY' | 'BUG' | 'CODE_QUALITY' | 'PERFORMANCE' | 'BEST_PRACTICE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  code?: string;
  recommendation?: string;
  fixCode?: string;
  cweId?: string;
  cvssScore?: number;
}

export async function POST(req: NextRequest) {
  let reviewId: string | null = null;
  
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'AI service not configured',
          detail: 'OPENAI_API_KEY is not set. Please add it to your .env file.'
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const projectId = body.projectId as string;
    let files = body.files as FileContent[] | undefined;

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.userId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // If files not provided, fetch from project
    if (!files || files.length === 0) {
      console.log('Fetching files for project:', projectId);
      files = await getProjectFilesForReview(projectId);
      console.log('Found files:', files.length, files.map(f => f.path));
      
      if (files.length === 0) {
        return NextResponse.json(
          { 
            error: 'No code files found in project',
            detail: 'Please generate some code first using the chat. The review needs code to analyze.'
          },
          { status: 400 }
        );
      }
    }

    // Create review record
    const review = await prisma.review.create({
      data: {
        projectId,
        status: 'IN_PROGRESS',
        totalFiles: files.length,
      },
    });

    reviewId = review.id;

    // Prepare files content for AI analysis
    const filesContent = files.map(f => `
File: ${f.path}
Language: ${f.language || 'unknown'}
\`\`\`
${f.content}
\`\`\`
`).join('\n\n');

    const prompt = `You are an expert code reviewer. Analyze the following code files and provide a comprehensive review.

Files to review:
${filesContent}

Provide your analysis in valid JSON format with the following structure:
{
  "score": <number 0-100>,
  "summary": "<overall summary>",
  "architectureDiagram": "<mermaid diagram syntax>",
  "complexityGraph": "<mermaid diagram syntax>",
  "files": [
    {
      "filePath": "<path>",
      "language": "<language>",
      "linesOfCode": <number>,
      "complexity": <number 0-100>,
      "score": <number 0-100>
    }
  ],
  "issues": [
    {
      "type": "SECURITY or BUG or CODE_QUALITY or PERFORMANCE or BEST_PRACTICE",
      "severity": "CRITICAL or HIGH or MEDIUM or LOW or INFO",
      "title": "<short title>",
      "description": "<detailed description>",
      "filePath": "<path>",
      "lineStart": <number>,
      "lineEnd": <number>,
      "code": "<affected code snippet>",
      "recommendation": "<fix recommendation>",
      "fixCode": "<suggested fixed code>",
      "cweId": "<CWE-XXX if applicable>",
      "cvssScore": <number 0-10 if applicable>
    }
  ]
}

Analyze for:
1. Overall code quality score (0-100)
2. Security vulnerabilities (with CWE IDs and CVSS scores if applicable)
3. Bugs and potential issues
4. Code quality issues
5. Performance concerns
6. Best practice violations
7. Architecture diagram in Mermaid format
8. Complexity analysis graph in Mermaid format

Provide comprehensive, actionable feedback. Return ONLY valid JSON, no markdown formatting.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse JSON response
    const reviewData = JSON.parse(responseText);

    // Count issues by severity
    const issuesBySeverity = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0,
    };

    reviewData.issues.forEach((issue: IssueData) => {
      issuesBySeverity[issue.severity as keyof typeof issuesBySeverity]++;
    });

    // Update review with summary data
    await prisma.review.update({
      where: { id: review.id },
      data: {
        status: 'COMPLETED',
        summary: reviewData.summary,
        score: reviewData.score,
        architectureDiagram: reviewData.architectureDiagram,
        complexityGraph: reviewData.complexityGraph,
        totalIssues: reviewData.issues.length,
        criticalIssues: issuesBySeverity.CRITICAL,
        highIssues: issuesBySeverity.HIGH,
        mediumIssues: issuesBySeverity.MEDIUM,
        lowIssues: issuesBySeverity.LOW,
        completedAt: new Date(),
      },
    });

    // Create file records
    for (const fileData of reviewData.files) {
      await prisma.reviewFile.create({
        data: {
          reviewId: review.id,
          filePath: fileData.filePath,
          language: fileData.language,
          linesOfCode: fileData.linesOfCode,
          complexity: fileData.complexity,
          score: fileData.score,
        },
      });
    }

    // Create issue records
    for (const issueData of reviewData.issues) {
      const file = await prisma.reviewFile.findFirst({
        where: {
          reviewId: review.id,
          filePath: issueData.filePath,
        },
      });

      await prisma.codeIssue.create({
        data: {
          reviewId: review.id,
          fileId: file?.id,
          type: issueData.type,
          severity: issueData.severity,
          title: issueData.title,
          description: issueData.description,
          filePath: issueData.filePath,
          lineStart: issueData.lineStart,
          lineEnd: issueData.lineEnd,
          code: issueData.code,
          recommendation: issueData.recommendation,
          fixCode: issueData.fixCode,
          cweId: issueData.cweId,
          cvssScore: issueData.cvssScore,
        },
      });
    }

    // Fetch the complete review
    const completeReview = await prisma.review.findUnique({
      where: { id: review.id },
      include: {
        files: {
          include: {
            issues: true,
          },
        },
        issues: true,
      },
    });

    return NextResponse.json({ review: completeReview });
  } catch (error) {
    console.error('Error generating review:', error);
    
    // Update review to FAILED status if it was created
    if (reviewId) {
      try {
        await prisma.review.update({
          where: { id: reviewId },
          data: {
            status: 'FAILED',
            summary: `Review failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        });
      } catch (updateError) {
        console.error('Failed to update review status:', updateError);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate review', 
        detail: error instanceof Error ? error.message : 'Unknown error',
        reviewId
      },
      { status: 500 }
    );
  }
}
