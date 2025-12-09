import { Card } from "@/components/ui/card";
import { Fragment, MessageType, MessageRole } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import Image from "next/image";
import { SupabaseActionCard } from "./supabase-action-card";
import { shouldShowSupabaseCard } from "@/lib/detect-database-need";
import { DatabaseResultCard } from "./database-result-card";

interface UserMessageProps {
  content: string;
}

const UserMessage = ({ content }: UserMessageProps) => {
  return (
    <div className="flex justify-end pb-4 pr-2 pl-10">
      <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words">
        {content}
      </Card>
    </div>
  );
};

interface FragmentCardProps {
  fragment: Fragment;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
}

const FragmentCard = ({
  fragment,
  isActiveFragment,
  onFragmentClick,
}: FragmentCardProps) => {
  return (
    <button
      className={cn(
        "flex items-start float-start gap-2 rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors",
        isActiveFragment &&
          "bg-primary text-primary-foreground border-primary hover:bg-primary"
      )}
      onClick={() => onFragmentClick(fragment)}
    >
      <Code2Icon className="size-4 mt-0.5" />
      <div className="flex flex-col flex-1">
        <span className="text-sm font-medium line-clamp-1">{fragment.title}</span>
        <span className="text-sm">Preview</span>
      </div>
      <div className="flex items-center justify-center mt-0.5">
        <ChevronRightIcon className="size-4" />
      </div>
    </button>
  );
};

interface AssistantMessageProps {
  content: string;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}

// Detect if message content is a database query result
const isDatabaseResult = (content: string): boolean => {
  return (
    content.startsWith("✅") ||
    content.startsWith("❌") ||
    (content.includes("retrieved") && content.includes("record")) ||
    (content.includes("inserted") && content.includes("into")) ||
    (content.includes("updated") && content.includes("in")) ||
    (content.includes("deleted") && content.includes("from")) ||
    content.includes("|") // Table format
  );
};

const AssistantMessage = ({
  content,
  fragment,
  isActiveFragment,
  onFragmentClick,
  type,
}: AssistantMessageProps) => {
  const showSupabaseCard = type === "RESULT" && shouldShowSupabaseCard(content);
  const isDbResult = isDatabaseResult(content);

  return (
    <div
      className={cn(
        "flex flex-col group px-2 pb-4",
        type === "ERROR" && "text-red-700 dark:text-red-500"
      )}
    >
      <div className="flex items-center gap-2 pl-2 mb-2">
        <Image
          src="/favicon.png"
          alt="trikon"
          width={18}
          height={18}
          className="shrink-0"
        />
        <span className="text-sm font-medium">Vibe</span>
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </span>
      </div>
      <div className="pl-8.5 flex flex-col gap-y-4">
        {isDbResult ? (
          <DatabaseResultCard
            content={content}
            isError={content.startsWith("❌")}
          />
        ) : (
          <span>{content}</span>
        )}
        {fragment && type === "RESULT" && (
          <FragmentCard
            fragment={fragment}
            isActiveFragment={isActiveFragment}
            onFragmentClick={onFragmentClick}
          />
        )}
        {showSupabaseCard && (
          <SupabaseActionCard />
        )}
      </div>
    </div>
  );
};

interface MessageCardProps {
  content: string;
  role: MessageRole;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}

export const MessageCard = ({
  content,
  role,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: MessageCardProps) => {
  if (role === "ASSISTANT") {
    return (
      <AssistantMessage
        content={content}
        fragment={fragment}
        createdAt={createdAt}
        isActiveFragment={isActiveFragment}
        onFragmentClick={onFragmentClick}
        type={type}
      />
    );
  }

  return <UserMessage content={content} />;
};
