"use client";

import { Card } from "@/components/ui/card";
import { CheckCircleIcon, AlertCircleIcon, TableIcon } from "lucide-react";

interface DatabaseResultCardProps {
  content: string;
  isError?: boolean;
}

export const DatabaseResultCard = ({
  content,
  isError = false,
}: DatabaseResultCardProps) => {
  // Check if content is a table (contains pipe characters for table formatting)
  const isTable = content.includes("|");

  return (
    <Card className="bg-muted border border-muted-foreground/20 rounded-lg p-4 shadow-none my-2">
      <div className="flex items-start gap-3">
        {isError ? (
          <AlertCircleIcon className="size-5 mt-0.5 text-red-500 flex-shrink-0" />
        ) : (
          <CheckCircleIcon className="size-5 mt-0.5 text-green-500 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          {isTable ? (
            <div className="overflow-x-auto">
              <pre className="text-xs bg-background rounded p-2 border border-muted-foreground/10">
                <code className="text-muted-foreground">{content}</code>
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              {content.includes("Retrieved") && (
                <TableIcon className="size-4 text-blue-500 flex-shrink-0" />
              )}
              <span className={isError ? "text-red-600 dark:text-red-400" : ""}>
                {content}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
