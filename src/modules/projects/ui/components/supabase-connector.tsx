'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, ExternalLink, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SupabaseProjectsList } from './supabase-projects-list';
import { SupabaseCreateProject } from './supabase-create-project';

interface SupabaseConnectorProps {
  onClose?: () => void;
}

export const SupabaseConnector = ({ onClose }: SupabaseConnectorProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/integrations/supabase');
        
        if (!response.ok) {
          throw new Error('Failed to check connection status');
        }

        const data = await response.json();
        setIsConnected(data.isConnected && !data.needsReconnect);
      } catch (err) {
        console.error('Connection check error:', err);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  const handleConnect = async () => {
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

  const handleConnectProject = () => {
    setShowProjects(true);
  };

  const handleCreateProject = () => {
    setShowCreateForm(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setShowProjects(true);
    toast.success('Refreshing projects list...');
  };

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreateForm(false)}
          className="mb-2"
        >
          ← Back
        </Button>
        <SupabaseCreateProject
          onCancel={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    );
  }

  if (showProjects) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowProjects(false)}
          className="mb-2"
        >
          ← Back to Overview
        </Button>
        
        <div className="space-y-4">
          <SupabaseProjectsList onProjectSelected={onClose} />
          
          {/* Create New Project Button */}
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleCreateProject}
            >
              <span className="text-lg">+</span>
              Create project
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-[#1e2b43]">
          <Zap className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">Supabase</h2>
            {loading ? (
              <Badge variant="outline" className="text-xs">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Checking...
              </Badge>
            ) : isConnected ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-orange-400 text-orange-400">
                <AlertCircle className="w-3 h-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Connect your own Supabase project
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Overview</h3>
        <p className="text-sm text-muted-foreground">
          Integrate user authentication, data storage, and backend capabilities with Supabase.
          Connect your Supabase account to access your projects and databases directly from this app.
        </p>
      </div>

      {/* Project Section */}
      <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold">Project</h3>
              {!isConnected && (
                <Badge variant="outline" className="text-xs border-orange-400 text-orange-400">
                  Not connected
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? 'Choose the Supabase project to sync with.'
                : 'Connect your Supabase account to get started.'}
            </p>
          </div>
          {isConnected ? (
            <Button onClick={handleConnectProject}>
              Connect a project
            </Button>
          ) : (
            <Button onClick={handleConnect} disabled={connecting}>
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Account'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Created by</p>
            <a
              href="https://vibe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline flex items-center gap-1"
            >
              Vibe <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Docs</p>
            <a
              href="https://supabase.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline flex items-center gap-1"
            >
              supabase.com/docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
