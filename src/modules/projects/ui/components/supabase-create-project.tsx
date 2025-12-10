'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SupabaseCreateProjectProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const REGIONS = [
  { value: 'us-east-1', label: 'East US (North Virginia)', region: 'North America' },
  { value: 'us-west-1', label: 'West US (North California)', region: 'North America' },
  { value: 'eu-west-1', label: 'West EU (Ireland)', region: 'Europe' },
  { value: 'eu-west-2', label: 'West EU (London)', region: 'Europe' },
  { value: 'eu-central-1', label: 'Central EU (Frankfurt)', region: 'Europe' },
  { value: 'ap-northeast-1', label: 'Northeast Asia (Tokyo)', region: 'Asia-Pacific' },
  { value: 'ap-southeast-1', label: 'Southeast Asia (Singapore)', region: 'Asia-Pacific' },
  { value: 'ap-southeast-2', label: 'Southeast Asia (Sydney)', region: 'Asia-Pacific' },
];

export const SupabaseCreateProject = ({ onCancel, onSuccess }: SupabaseCreateProjectProps) => {
  const [projectName, setProjectName] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('ap-southeast-1');
  const [creating, setCreating] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleCreate = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setCreating(true);

      const response = await fetch('/api/integrations/supabase/create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          region,
          dbPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      toast.success('Project created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Create project error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create project';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Create a new project</h3>
        <p className="text-sm text-muted-foreground">
          Your project will have its own dedicated instance and full Postgres database.
        </p>
        <p className="text-sm text-muted-foreground">
          An API will be set up so you can easily interact with your new database.
        </p>
      </div>

      {/* Organization (Read-only for now) */}
      <div className="space-y-2">
        <Label htmlFor="organization">Organization</Label>
        <Select disabled defaultValue="default">
          <SelectTrigger id="organization">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">mdkulkarni2005&apos;s Org <span className="text-xs text-muted-foreground ml-2">FREE</span></SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Name */}
      <div className="space-y-2">
        <Label htmlFor="projectName">Project name</Label>
        <Input
          id="projectName"
          placeholder="Project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>

      {/* Database Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Database password</Label>
        <div className="flex gap-2">
          <Input
            id="password"
            type="password"
            placeholder="Type in a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={generatePassword}
            className="shrink-0"
          >
            Generate
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          This is the password to your Postgres database, so it must be strong and hard to guess.{' '}
          <button
            type="button"
            onClick={generatePassword}
            className="text-foreground underline hover:no-underline"
          >
            Generate a password
          </button>
          .
        </p>
      </div>

      {/* Region */}
      <div className="space-y-2">
        <Label htmlFor="region">Region</Label>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger id="region">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select the region closest to your users for the best performance.
        </p>
      </div>

      {/* Security Options */}
      <Collapsible open={securityOpen} onOpenChange={setSecurityOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className={`w-4 h-4 transition-transform ${securityOpen ? 'rotate-90' : ''}`} />
          SECURITY OPTIONS
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Additional security options will be available here.
          </p>
        </CollapsibleContent>
      </Collapsible>

      {/* Advanced Configuration */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-90' : ''}`} />
          ADVANCED CONFIGURATION
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Advanced configuration options will be available here.
          </p>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={creating}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={creating || !projectName.trim() || !password}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating project...
            </>
          ) : (
            'Create new project'
          )}
        </Button>
      </div>
    </div>
  );
};
