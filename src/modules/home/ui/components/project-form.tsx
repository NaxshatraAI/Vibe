"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpIcon, Loader2Icon, GithubIcon, Paperclip } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpic/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "../../constants";
import { useClerk } from "@clerk/nextjs";

/* ---------------------------- SCHEMA ---------------------------- */

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Message is required" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

/* ---------------------------- MAIN COMPONENT ---------------------------- */

export const ProjectForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const clerk = useClerk();

  const [showGitHubDialog, setShowGitHubDialog] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [githubRepoName, setGithubRepoName] = useState("");
  const [isSettingUpGitHub, setIsSettingUpGitHub] = useState(false);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);

  // Check if GitHub is connected on mount
  useEffect(() => {
    const checkGitHubConnection = async () => {
      try {
        const response = await fetch("/api/github/status");
        if (response.ok) {
          const data = await response.json();
          setIsGitHubConnected(data.connected);
        }
      } catch (error) {
        console.error("Failed to check GitHub connection:", error);
      }
    };
    checkGitHubConnection();

    // Check for GitHub connection success message in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("github_connected") === "true") {
      toast.success("GitHub account connected successfully!");
      setIsGitHubConnected(true);
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    
    // Check for errors
    const error = urlParams.get("error");
    if (error) {
      toast.error(`GitHub connection failed: ${error}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { value: "" },
  });

  /* ---------------------------- MUTATION ---------------------------- */

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
        queryClient.invalidateQueries(trpc.usage.status.queryOptions());
        setCreatedProjectId(data.id);
        setShowGitHubDialog(true);
      },
      onError: (error) => {
        toast.error(error.message || "An error occurred");
        if (error?.data?.code === "UNAUTHORIZED") clerk.openSignIn();
        if (error?.data?.code === "TOO_MANY_REQUESTS") router.push("/pricing");
      },
    })
  );

  /* ---------------------------- GITHUB SETUP ---------------------------- */

  const connectGitHub = () => {
    // Redirect to OAuth flow
    window.location.href = "/api/github/auth";
  };

  const setupGitHub = async () => {
    if (!createdProjectId || !githubRepoName) {
      toast.error("Please provide a repository name");
      return;
    }

    setIsSettingUpGitHub(true);
    try {
      const response = await fetch("/api/github/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: createdProjectId,
          repoName: githubRepoName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.error === "GitHub not connected") {
          toast.error("Please connect your GitHub account first");
          setShowGitHubDialog(false);
          connectGitHub();
          return;
        }
        toast.error(data.error || "Failed to set up GitHub repository");
        return;
      }

      toast.success(`GitHub repo created: ${data.repoName}`);
      setShowGitHubDialog(false);
      router.push(`/projects/${createdProjectId}`);
    } catch {
      toast.error("Unexpected error setting up GitHub");
    } finally {
      setIsSettingUpGitHub(false);
    }
  };

  /* ---------------------------- SUBMIT ---------------------------- */

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    await createProject.mutateAsync({
      value: value.value,
    });
  };

  const onSelect = (value: string) => {
    form.setValue("value", value, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const isPending = createProject.isPending;
  const isButtonDisabled = isPending || !form.formState.isValid;

  /* ============================= ✅ UI ============================= */

  return (
    <Form {...form}>
      {/* ✅ REAL FORM ADDED — THIS FIXES SUBMISSION */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 space-y-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">
          What can I help you build?
        </h2>

        <div className="w-full">
          {/* ✅ GLOW CHAT CONTAINER */}
          <div
            className="
              relative rounded-2xl bg-black/70 backdrop-blur-2xl
              border border-white/15
              shadow-[0_0_15px_rgba(0,255,255,0.25),0_0_25px_rgba(168,85,247,0.25)]
              transition-all duration-300
            "
          >
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <textarea
                  {...field}
                  disabled={isPending}
                  placeholder="Ask Trikon to build something..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)(e);
                    }
                  }}
                  className="
                    w-full px-5 py-4 resize-none bg-transparent border-none
                    text-white text-[15px] leading-relaxed focus:outline-none
                    placeholder:text-white/35 min-h-[64px]
                  "
                />
              )}
            />

            <div className="flex items-center justify-between p-3">
              <button
                type="button"
                className="p-2 hover:bg-white/[0.05] rounded-lg"
              >
                <Paperclip className="w-4 h-4 text-white/60" />
              </button>

              {/* ✅ SUBMIT BUTTON FIXED */}
             <Button
  type="submit"
  disabled={isButtonDisabled}
  className={cn(
    "px-3 py-2 rounded-lg transition-all duration-200 border flex items-center gap-1 shadow-lg",
    !isButtonDisabled
      ? "bg-gradient-to-r from-teal-500 to-violet-500 text-white border-transparent hover:shadow-[0_0_12px_rgba(0,255,255,0.4)] active:scale-[0.97]"
      : "bg-white/5 text-white/30 border-white/10 opacity-50 cursor-not-allowed shadow-none"
  )}
>
  {isPending ? (
    <Loader2Icon className="animate-spin w-4 h-4" />
  ) : (
    <ArrowUpIcon className="w-4 h-4" />
  )}
</Button>

            </div>
          </div>

          {/* ✅ TEMPLATE BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            {PROJECT_TEMPLATES.map((template) => (
              <button
                key={template.title}
                type="button"
                onClick={() => onSelect(template.prompt)}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-full
                  bg-black/60 text-white/60
                  border border-white/15
                  shadow-[0_0_8px_rgba(0,255,255,0.25),0_0_12px_rgba(168,85,247,0.28)]
                  hover:text-white hover:bg-black/80 hover:scale-[1.05]
                  transition-all duration-200
                  text-xs
                "
              >
                <span>{template.emoji}</span>
                {template.title}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* ✅ GITHUB DIALOG */}
      <Dialog open={showGitHubDialog} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              <GithubIcon className="inline mr-2" />
              Connect to GitHub (Required)
            </DialogTitle>
            <DialogDescription>
              Set up a GitHub repository for your project. This is required to save and manage your code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!isGitHubConnected && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-3">
                  You need to connect your GitHub account first
                </p>
                <Button
                  onClick={connectGitHub}
                  className="w-full"
                  variant="outline"
                >
                  <GithubIcon className="mr-2 h-4 w-4" />
                  Connect GitHub Account
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Repository Name</label>
              <Input
                placeholder="my-awesome-project"
                value={githubRepoName}
                onChange={(e) => setGithubRepoName(e.target.value)}
                disabled={isSettingUpGitHub}
              />
              <p className="text-xs text-muted-foreground">
                Letters, numbers, hyphens, and underscores only
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={setupGitHub}
              disabled={!githubRepoName || isSettingUpGitHub}
              className="w-full"
            >
              {isSettingUpGitHub ? "Creating Repository..." : "Create GitHub Repository"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
};
