'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Database, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface SupabaseProject {
  id: string;
  name: string;
  region: string;
  created_at: string;
}

interface SupabaseProjectsListProps {
  onProjectSelected?: (projectId: string) => void;
}

export const SupabaseProjectsList = ({ onProjectSelected }: SupabaseProjectsListProps) => {
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectingProjectId, setSelectingProjectId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/integrations/supabase/projects');

        if (!response.ok) {
          const data = await response.json();
          throw new Error(
            data.error || `Failed to fetch projects (${response.status})`
          );
        }

        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch projects';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleConnectSupabase = async () => {
    try {
      setConnecting(true);
      setError(null);

      const response = await fetch('/api/integrations/supabase', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Failed to start Supabase connection (${response.status})`
        );
      }

      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect Supabase';
      setError(message);
      toast.error(message);
      setConnecting(false);
    }
  };

  const handleSelectProject = async (projectId: string) => {
    try {
      setSelectingProjectId(projectId);
      setError(null);

      const response = await fetch('/api/integrations/supabase/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Failed to select project (${response.status})`
        );
      }

      setSelectedProjectId(projectId);
      toast.success('Project selected successfully');

      if (onProjectSelected) {
        onProjectSelected(projectId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to select project';
      setError(message);
      toast.error(message);
    } finally {
      setSelectingProjectId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Supabase Projects
          </CardTitle>
          <CardDescription>Loading your projects...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && projects.length === 0) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            Error Loading Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Supabase Projects
          </CardTitle>
          <CardDescription>No projects found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You don&apos;t have any Supabase projects yet. Create one at{' '}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              supabase.com
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  // Projects list
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase Projects
        </CardTitle>
        <CardDescription>
          {projects.length} project{projects.length !== 1 ? 's' : ''} found
        </CardDescription>
        <div className="mt-2">
          <Button
            onClick={handleConnectSupabase}
            disabled={connecting}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {connecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Connect Supabase
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold flex items-center gap-2">
                    {project.name}
                    {selectedProjectId === project.id && (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Region: <span className="font-medium">{project.region}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  onClick={() => handleSelectProject(project.id)}
                  disabled={selectingProjectId !== null}
                  variant={selectedProjectId === project.id ? 'default' : 'outline'}
                  size="sm"
                  className="min-w-fit"
                >
                  {selectingProjectId === project.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Selecting...
                    </>
                  ) : selectedProjectId === project.id ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    'Select Project'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
