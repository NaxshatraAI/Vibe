import { inngest } from "./client";
import {
  openai,
  createAgent,
  createTool,
  createNetwork,
  type Tool,
  Message,
  createState,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent, parseAgentOutput } from "./utils";
import { z } from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";
import { SANDBOX_TIMEOUT } from "./types";
import { getSelectedSupabaseProject } from "@/lib/workspace-settings";
import {
  extractDatabaseQueries,
  executeDatabaseQuery,
  formatQueryResult,
  hasDatabaseQueries,
} from "./db-query-handler";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
  workspaceContext?: {
    supabaseProjectId?: string | null;
    userId?: string | null;
  };
  databaseResults?: Array<{
    query: Record<string, unknown>;
    result: string;
  }>;
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("manas-vibe-nextjs-test-2");
      await sandbox.setTimeout(SANDBOX_TIMEOUT); // 20 minutes
      return sandbox.sandboxId;
    });

    // Get workspace context including selected Supabase project
    const workspaceContext = await step.run("get-workspace-context", async () => {
      const { projectId, projectName } = await getSelectedSupabaseProject();
      return {
        supabaseProjectId: projectId,
        supabaseProjectName: projectName,
      };
    });

    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const formattedMessages: Message[] = [];

        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        });
        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          });
        }
        return formattedMessages.reverse();
      }
    );

    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
        workspaceContext,
      },
      { messages: previousMessages }
    );

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      system: PROMPT,
      description:
        "A senior software engineer working in a sandboxed Next.js environment.",
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1,
        },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (e) {
                console.log(
                  `Command failed: ${e}\nstdout:${buffers.stdout}\nstderror: ${buffers.stderr}`
                );
                return `Command failed: ${e}\nstdout:${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFile",
          description: "Create or update a file in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run(
              "CreateOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (error) {
                  return "Error: " + error;
                }
              }
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read fiels from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readfiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return `Error reading files: ${e}`;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }

            // Check if response contains database queries
            if (
              hasDatabaseQueries(lastAssistantMessageText) &&
              network.state.data.workspaceContext?.supabaseProjectId
            ) {
              // Extract database queries from the AI response
              const queries = extractDatabaseQueries(lastAssistantMessageText);

              if (queries.length > 0) {
                // Get the sandbox URL for executing queries
                const sandbox = await getSandbox(sandboxId);
                const appUrl = `https://${sandbox.getHost(3000)}`;

                // Initialize database results array if not exists
                if (!network.state.data.databaseResults) {
                  network.state.data.databaseResults = [];
                }

                // Execute each detected database query
                for (const query of queries) {
                  try {
                    const queryResult = await executeDatabaseQuery(
                      query.queryBody,
                      appUrl
                    );
                    const formattedResult = formatQueryResult(queryResult);

                    network.state.data.databaseResults.push({
                      query: query.queryBody,
                      result: formattedResult,
                    });
                  } catch (error) {
                    network.state.data.databaseResults.push({
                      query: query.queryBody,
                      result: `❌ Error executing query: ${error instanceof Error ? error.message : String(error)}`,
                    });
                  }
                }
              }
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "code-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) {
          return;
        }

        return codeAgent;
      },
    });

    const result = await network.run(event.data.value, { state });

    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "Generates a short, descriptive title for a code fragment.",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "Generates a user-friendly message explaining what was built.",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });
    
    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(result.state.data.summary)
    const { output: responseOutput } = await responseGenerator.run(result.state.data.summary)

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }
      const mainMessage = await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: parseAgentOutput(responseOutput),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: parseAgentOutput(fragmentTitleOutput),
              files: result.state.data.files,
            },
          },
        },
      });

      // Save database query results as separate messages
      if (result.state.data.databaseResults && result.state.data.databaseResults.length > 0) {
        for (const dbResult of result.state.data.databaseResults) {
          await prisma.message.create({
            data: {
              projectId: event.data.projectId,
              content: dbResult.result,
              role: "ASSISTANT",
              type: "RESULT",
            },
          });
        }
      }

      return mainMessage;
    });

    // Auto-push to GitHub if enabled
    await step.run("auto-push-to-github", async () => {
      if (isError) return null;

      const project = await prisma.project.findUnique({
        where: { id: event.data.projectId },
        select: { githubEnabled: true, githubRepoName: true, userId: true },
      });

      if (!project?.githubEnabled || !project.githubRepoName) {
        return null; // Skip if GitHub not enabled
      }

      // Note: Auto-push requires storing GitHub token securely
      // For now, this is a placeholder. In production, you'd store encrypted tokens per user
      console.log(`Auto-push triggered for project ${event.data.projectId} to repo ${project.githubRepoName}`);
      
      return null;
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
