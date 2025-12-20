"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpIcon,
  Loader2Icon,
  GithubIcon,
  Paperclip,
} from "lucide-react";
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

import "./ProjectForm.css";

/* ---------------------------- SCHEMA ---------------------------- */

const formSchema = z.object({
  value: z.string().min(1).max(1000),
});

/* ---------------------------- COMPONENT ---------------------------- */

export const ProjectForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const clerk = useClerk();

  const [showGitHubDialog, setShowGitHubDialog] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [githubRepoName, setGithubRepoName] = useState("");
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);

  useEffect(() => {
    fetch("/api/github/status")
      .then((r) => r.json())
      .then((d) => setIsGitHubConnected(d.connected))
      .catch(() => { });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { value: "" },
  });

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        setCreatedProjectId(data.id);
        setShowGitHubDialog(true);
      },
    })
  );

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    await createProject.mutateAsync({ value: value.value });
  };

  const onSelect = (value: string) => {
    form.setValue("value", value, { shouldDirty: true });
  };

  const isPending = createProject.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="promptWrapper">
        <div className="promptBox">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <textarea
                {...field}
                className="textarea"
                placeholder="Ask Trikon to build something..."
                disabled={isPending}
              />
            )}
          />

          <div className="actionRow">
            <div className="leftGroup">
              <button type="button" className="iconButton">
                <Paperclip size={16} />
              </button>
            </div>

            <button type="submit" className="sendButton">
              {isPending ? (
                <Loader2Icon className="animate-spin" size={16} />
              ) : (
                <ArrowUpIcon size={16} />
              )}
            </button>
          </div>

         
        </div>
         <div className="templates">
            {PROJECT_TEMPLATES.map((t) => (
              <button
                key={t.title}
                type="button"
                className="importButton"
                onClick={() => onSelect(t.prompt)}
              >
                {t.emoji} {t.title}
              </button>
            ))}
          </div>
      </form>
      

      <Dialog open={showGitHubDialog} onOpenChange={setShowGitHubDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <GithubIcon className="inline mr-2" />
              Connect GitHub
            </DialogTitle>
            <DialogDescription>
              Create a repository or skip for now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">Skip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
};
