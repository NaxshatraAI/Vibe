'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const SupabaseActionCard = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/integrations/supabase", {
        method: "POST",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start Supabase connection");
      }

      const data = await response.json();
      
      // Redirect to Supabase OAuth authorization
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error("No authorization URL received");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to connect Supabase"
      );
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 mt-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-base text-blue-900 dark:text-blue-100">
              Connect Supabase Database
            </CardTitle>
          </div>
        </div>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          Add a database connection to your project for data persistence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600 gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Connect Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
