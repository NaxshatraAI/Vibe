"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpIcon, Loader2Icon, GithubIcon, Paperclip } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

  const startWorkflow = async () => {
    if (!createdProjectId) {
      toast.error("Project ID missing");
      return;
    }

    try {
      const response = await fetch("/api/projects/start-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: createdProjectId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to start workflow");
        return;
      }

      setShowGitHubDialog(false);
      router.push(`/projects/${createdProjectId}`);
    } catch {
      toast.error("Unexpected error starting workflow");
    }
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

  // const onSubmit = async (value: z.infer<typeof formSchema>) => {
  //   await createProject.mutateAsync({
  //     value: value.value,
  //   });
  // };

  // const onSelect = (value: string) => {
  //   form.setValue("value", value, {
  //     shouldDirty: true,
  //     shouldValidate: true,
  //     shouldTouch: true,
  //   });
  // };

  const isPending = createProject.isPending;
  // const isButtonDisabled = isPending || !form.formState.isValid;

  /* ============================= ✅ UI ============================= */

  return (
    <Form {...form}>
      {/* ✅ REAL FORM ADDED — THIS FIXES SUBMISSION */}
      <form
        onSubmit={form.handleSubmit((d) =>
          createProject.mutateAsync({ value: d.value })
        )}
        className="flex justify-center px-6 mt-10"
      >
        <div className="w-full max-w-4xl">

          {/* ================= PROMPT BOX ================= */}
          <div
            className="
              relative
              rounded-2xl
              bg-white/5
              backdrop-blur-md
              border border-white/20
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              p-4
            "
          >
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="Ask Trikon to build something..."
                  disabled={isPending}
                  className="
                    w-full
                    min-h-[140px]
                    resize-none
                    bg-transparent
                    text-white
                    placeholder:text-white/50
                    outline-none
                    pr-12
                    pb-12
                  "
                />
              )}
            />

            {/* IMPORT ICON */}
            <button
              type="button"
              className="
                absolute bottom-3 left-3
                w-9 h-9
                rounded-full
                bg-white/10
                border border-white/20
                flex items-center justify-center
                hover:bg-white/20
                transition
              "
            >
              <Paperclip size={16} className="text-white/80" />
            </button>

            {/* SEND ICON */}
            <button
              type="submit"
              disabled={!form.formState.isValid || isPending}
              className="
                absolute bottom-3 right-3
                w-9 h-9
                rounded-full
                bg-gradient-to-tr from-purple-500 to-cyan-400
                text-black
                flex items-center justify-center
                hover:scale-105
                transition
                disabled:opacity-50
              "
            >
              {isPending ? (
                <Loader2Icon size={16} className="animate-spin" />
              ) : (
                <ArrowUpIcon size={16} />
              )}
            </button>
          </div>

          {/* ================= TEMPLATES BELOW ================= */}
          <div className="flex flex-wrap gap-3 mt-5">
            {PROJECT_TEMPLATES.map((template) => (
              <button
                key={template.title}
                type="button"
                onClick={() =>
                  form.setValue("value", template.prompt, {
                    shouldValidate: true,
                  })
                }
                className="
                  flex items-center gap-2
                  px-4 py-2
                  rounded-full
                  bg-white/10
                  backdrop-blur-md
                  border border-white/20
                  text-white/80
                  text-sm
                  hover:bg-white/20
                  transition
                "
              >
                {template.emoji}
                {template.title}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* ✅ GITHUB DIALOG */}
      <Dialog open={showGitHubDialog} onOpenChange={setShowGitHubDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              <GithubIcon className="inline mr-2" />
              Connect to GitHub (Optional)
            </DialogTitle>
            <DialogDescription>
              Set up a GitHub repository to push and manage your code. You can also continue without it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!isGitHubConnected && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  Connect your GitHub account to create a repository
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

            {isGitHubConnected && (
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
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              onClick={startWorkflow}
              variant="outline"
              className="flex-1"
            >
              Skip for Now
            </Button>
            {isGitHubConnected && (
              <Button
                onClick={setupGitHub}
                disabled={!githubRepoName || isSettingUpGitHub}
                className="flex-1"
              >
                {isSettingUpGitHub ? "Creating Repository..." : "Create Repository"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
};
