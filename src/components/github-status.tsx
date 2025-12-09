import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GithubIcon, CheckCircle2, XCircle } from "lucide-react";

interface GitHubStatusProps {
  onStatusChange?: (connected: boolean) => void;
}

export const GitHubStatus = ({ onStatusChange }: GitHubStatusProps) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/github/status");
        if (response.ok) {
          const data = await response.json();
          setIsConnected(data.connected);
          setUsername(data.username);
          onStatusChange?.(data.connected);
        }
      } catch (error) {
        console.error("Failed to check GitHub status:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
  }, [onStatusChange]);

  const handleConnect = () => {
    window.location.href = "/api/github/auth";
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <GithubIcon className="h-4 w-4 animate-pulse" />
        <span>Checking GitHub connection...</span>
      </div>
    );
  }

  if (isConnected && username) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span className="text-muted-foreground">
          Connected as <span className="font-medium text-foreground">{username}</span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleConnect}
          className="h-7 text-xs"
        >
          Reconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <XCircle className="h-4 w-4 text-red-500" />
      <span className="text-sm text-muted-foreground">GitHub not connected</span>
      <Button
        onClick={handleConnect}
        size="sm"
        variant="outline"
        className="h-7"
      >
        <GithubIcon className="mr-1 h-3 w-3" />
        Connect
      </Button>
    </div>
  );
};
