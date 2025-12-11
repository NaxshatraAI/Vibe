'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Database, Loader2, CheckCircle, ExternalLink, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface SupabaseProject {
  id: string;
  name: string;
  region: string;
  created_at: string;
}

interface IntegrationData {
  isConnected: boolean;
  needsReconnect?: boolean;
  selectedProjectId?: string | null;
  selectedProjectName?: string | null;
}

interface SupabaseProjectsListProps {
  onProjectSelected?: (projectId: string) => void;
}

interface ClientCredentials {
  success: boolean;
  projectRef: string;
  projectName: string | null;
  apiUrl: string;
  anonKey: string;
}

export const SupabaseProjectsList = ({ onProjectSelected }: SupabaseProjectsListProps) => {
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string | null>(null);
  const [selectingProjectId, setSelectingProjectId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [hasExistingSelection, setHasExistingSelection] = useState(false);
  const [deselectingProject, setDeselectingProject] = useState(false);
  const [credentials, setCredentials] = useState<ClientCredentials | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  // Check connection status first
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setCheckingConnection(true);
        const response = await fetch('/api/integrations/supabase');
        
        if (!response.ok) {
          throw new Error('Failed to check connection status');
        }

        const data: IntegrationData = await response.json();
        setIsConnected(data.isConnected);

        // Check if user already has a selected project
        if (data.selectedProjectId) {
          setSelectedProjectId(data.selectedProjectId);
          setSelectedProjectName(data.selectedProjectName || null);
          setHasExistingSelection(true);
          // Fetch client credentials after selection is confirmed
          await fetchClientCredentials();
        }

        // If connected, fetch projects
        if (data.isConnected && !data.needsReconnect) {
          await fetchProjects();
        } else if (data.needsReconnect) {
          setError('Your Supabase connection has expired. Please reconnect.');
        }
      } catch (err) {
        console.error('Connection check error:', err);
        setIsConnected(false);
      } finally {
        setCheckingConnection(false);
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Fetch client-safe credentials for generated app
  const fetchClientCredentials = async () => {
    try {
      const response = await fetch('/api/integrations/supabase/credentials');

      if (response.ok) {
        const data: ClientCredentials = await response.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error('Failed to fetch credentials:', err);
    }
  };

  // Fetch projects function
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/integrations/supabase/projects');

      if (!response.ok) {
        const data = await response.json();
        if (data.requiresReconnect) {
          setIsConnected(false);
          throw new Error('Please reconnect your Supabase account');
        }
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

  const handleSelectProject = async (projectId: string, projectName: string) => {
    try {
      setSelectingProjectId(projectId);
      setError(null);

      const response = await fetch('/api/integrations/supabase/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, projectName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Failed to select project (${response.status})`
        );
      }

      setSelectedProjectId(projectId);
      setSelectedProjectName(projectName);
      setHasExistingSelection(true);
      toast.success('Project selected successfully');
      
      // Fetch client credentials after selection
      await fetchClientCredentials();

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

  const handleDeselectProject = async () => {
    try {
      setDeselectingProject(true);
      setError(null);

      const response = await fetch('/api/integrations/supabase/deselect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Failed to deselect project (${response.status})`
        );
      }

      setSelectedProjectId(null);
      setSelectedProjectName(null);
      setHasExistingSelection(false);
      setCredentials(null);
      setShowCredentials(false);
      toast.success('Project deselected successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deselect project';
      setError(message);
      toast.error(message);
    } finally {
      setDeselectingProject(false);
    }
  };

  const handleCopyEnv = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`Copied ${key} to clipboard`);
  };

  // Loading state
  if (loading || checkingConnection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Supabase Projects
          </CardTitle>
          <CardDescription>
            {checkingConnection ? 'Checking connection...' : 'Loading your projects...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not connected state - show connect button
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Connect Supabase
          </CardTitle>
          <CardDescription>
            Connect your Supabase account to manage your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To use Supabase integration, you need to connect your Supabase account first.
              This will allow you to:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
              <li>View and manage your Supabase projects</li>
              <li>Create and query databases</li>
              <li>Deploy your applications</li>
            </ul>
            
            <Button
              onClick={handleConnectSupabase}
              disabled={connecting}
              className="w-full gap-2"
              size="lg"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting to Supabase...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  Connect Supabase Account
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              You&apos;ll be redirected to Supabase to authorize this application
            </p>
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
    <Card className="sticky top-4 z-10">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Supabase Projects
          </CardTitle>
          <CardDescription>
            {hasExistingSelection && selectedProjectName ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Connected: {selectedProjectName}
              </span>
            ) : (
              <span>
                {projects.length} project{projects.length !== 1 ? 's' : ''} found
              </span>
            )}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <span className="flex items-center gap-1">
              Show <ChevronDown className="w-4 h-4" />
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Hide <ChevronUp className="w-4 h-4" />
            </span>
          )}
        </Button>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasExistingSelection && (
            <Alert className="mb-4 border-emerald-600 bg-emerald-50 dark:bg-emerald-950">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                <span>Project connected: <strong>{selectedProjectName}</strong></span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowCredentials(!showCredentials)}
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800"
                  >
                    {showCredentials ? 'Hide' : 'Show'} Env
                  </Button>
                  <Button
                    onClick={handleDeselectProject}
                    disabled={deselectingProject}
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-7 px-2 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800"
                  >
                    {deselectingProject ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Deselecting...
                      </>
                    ) : (
                      'Deselect'
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {showCredentials && credentials && (
            <Card className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
              <CardHeader>
                <CardTitle className="text-base">Client Environment Variables</CardTitle>
                <CardDescription>Copy these to your app config</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">SUPABASE_URL</label>
                  <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-blue-200 dark:border-blue-800">
                    <code className="flex-1 text-sm break-all">{credentials.apiUrl}</code>
                    <Button
                      onClick={() => handleCopyEnv('SUPABASE_URL', credentials.apiUrl)}
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">SUPABASE_ANON_KEY</label>
                  <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-blue-200 dark:border-blue-800">
                    <code className="flex-1 text-sm break-all">{credentials.anonKey}</code>
                    <Button
                      onClick={() => handleCopyEnv('SUPABASE_ANON_KEY', credentials.anonKey)}
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  These variables are safe to use in client-side code. Your service role key is securely stored server-side only.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3 max-h-[480px] overflow-auto pr-1">
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
                    onClick={() => handleSelectProject(project.id, project.name)}
                    disabled={selectingProjectId !== null || deselectingProject}
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
      )}
    </Card>
  );
};
