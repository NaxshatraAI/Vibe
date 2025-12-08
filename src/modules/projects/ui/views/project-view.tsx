"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CodeIcon,
  CrownIcon,
  EyeIcon,
  DownloadIcon,
  GithubIcon,
  FileSearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import { UserControl } from "@/components/user-control";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";
import { downloadProjectAsZip } from "@/lib/download-utils";
import { toast } from "sonner";
import { useTRPC } from "@/trpic/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ReviewTab } from "@/modules/reviews/ui/components/review-tab";

interface Props {
  projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
  const { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro" });
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<"preview" | "code" | "review">(
    "preview"
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPushingToGitHub, setIsPushingToGitHub] = useState(false);

  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  const handleDownload = async () => {
    if (!activeFragment?.files) {
      toast.error("No code to download. Please generate some code first.");
      return;
    }

    setIsDownloading(true);
    try {
      await downloadProjectAsZip(
        activeFragment.files as Record<string, string>,
        project.name || "nextjs-project",
        false
      );
      toast.success("Project downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download project. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePushToGitHub = async () => {
    if (!project.githubEnabled) {
      toast.error("GitHub not set up for this project. Please set it up first.");
      return;
    }

    setIsPushingToGitHub(true);
    try {
      const response = await fetch("/api/github/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          commitMessage: `Update from Vibe - ${new Date().toLocaleString()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.detail || data.error || "Failed to push to GitHub";
        toast.error(errorMsg);
        return;
      }

      toast.success(`Pushed ${data.filesCount} files to GitHub!`);
    } catch (error) {
      console.error("GitHub push failed:", error);
      toast.error("Failed to push to GitHub");
    } finally {
      setIsPushingToGitHub(false);
    }
  };

  return (
    <div
      className="
        h-screen
        bg-black/60 backdrop-blur-xl
        border border-white/10
        shadow-[0_0_25px_rgba(0,255,255,0.18),0_0_40px_rgba(168,85,247,0.18)]
      "
    >
      <ResizablePanelGroup direction="horizontal">

        {/* ✅ LEFT PANEL */}
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col m-0 border-r border-white/10 bg-black/50 backdrop-blur-xl"
        >
          <ErrorBoundary fallback={<p>Project header error</p>}>
            <Suspense fallback={<p className="text-white/50 p-4">Loading project...</p>}>
              <ProjectHeader projectId={projectId} />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary fallback={<p>Messages error</p>}>
            <Suspense fallback={<p className="text-white/50 p-4">Loading messages...</p>}>
              <MessagesContainer
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
              />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>

        <ResizableHandle className="bg-white/5 hover:bg-cyan-400/30 transition-colors" />

        {/* ✅ RIGHT PANEL */}
        <ResizablePanel defaultSize={65} minSize={50} className="bg-black/40 backdrop-blur-xl">

          <Tabs
            className="h-full gap-y-0"
            defaultValue="preview"
            value={tabState}
            onValueChange={(value) =>
              setTabState(value as "preview" | "code" | "review")
            }
          >
            {/* ✅ TOP BAR */}
            <div className="w-full flex items-center p-3 border-b border-white/10 gap-x-2 bg-black/60 backdrop-blur-xl">

              <TabsList className="h-9 p-1 border border-white/10 rounded-lg bg-black/50">
                <TabsTrigger value="preview" className="rounded-md flex items-center gap-1">
                  <EyeIcon className="w-4 h-4" /> Demo
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-md flex items-center gap-1">
                  <CodeIcon className="w-4 h-4" /> Code
                </TabsTrigger>
                <TabsTrigger value="review" className="rounded-md flex items-center gap-1">
                  <FileSearchIcon className="w-4 h-4" /> Review
                </TabsTrigger>
              </TabsList>

              <div className="ml-auto flex items-center gap-x-2">
                {activeFragment?.files && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/40 border-white/10 text-white hover:bg-black/70"
                      onClick={handlePushToGitHub}
                      disabled={isPushingToGitHub || !project.githubEnabled}
                    >
                      <GithubIcon className="w-4 h-4" />
                      <span>
                        {isPushingToGitHub ? "Pushing..." : "GitHub"}
                      </span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/40 border-white/10 text-white hover:bg-black/70"
                      onClick={handleDownload}
                      disabled={isDownloading}
                    >
                      <DownloadIcon
                        className={isDownloading ? "animate-spin" : ""}
                      />
                      {isDownloading ? "Downloading..." : "Download"}
                    </Button>
                  </>
                )}

                {!hasProAccess && (
                  <Button
                  asChild
                    size="sm"
                    variant="default"
                    className="bg-blue-600 text-white hover:bg-blue-700"
>
                        <Link href="/pricing" className="flex items-center gap-1">
                          <CrownIcon className="w-4 h-4" /> Upgrade
                        </Link>
                      </Button>

                )}

                <UserControl />
              </div>
            </div>

            {/* ✅ TAB CONTENTS */}
            <TabsContent value="preview">
              {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>

            <TabsContent value="code" className="min-h-0">
              {!!activeFragment?.files && (
                <FileExplorer
                  files={activeFragment.files as { [path: string]: string }}
                />
              )}
            </TabsContent>

            <TabsContent value="review" className="h-full overflow-hidden">
              <ReviewTab projectId={projectId} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
