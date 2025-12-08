'use client';

import { useState } from 'react';
import { useTRPC } from '@/trpic/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, FileSearch } from 'lucide-react';
import { ReviewOverview } from './review-overview';
import { IssuesList } from './issues-list';
import { DiagramViewer } from './diagram-viewer';
import { toast } from 'sonner';

interface ReviewTabProps {
  projectId: string;
}

export function ReviewTab({ projectId }: ReviewTabProps) {
  const trpc = useTRPC();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const { data: review, isLoading, refetch } = useQuery(
    trpc.reviews.getLatest.queryOptions(
      { projectId },
      { 
        refetchInterval: (query) => {
          // Only poll if review is in progress
          const data = query.state.data;
          return data?.status === 'IN_PROGRESS' ? 5000 : false;
        },
        enabled: !!projectId 
      }
    )
  );

  const handleGenerateReview = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/review/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.detail || data.error || 'Failed to generate review';
        throw new Error(errorMsg);
      }

      toast.success('Review generated successfully!');
      await refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate review';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const response = await fetch('/api/review/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (response.ok) {
        toast.success('Stuck reviews cleaned up');
        await refetch();
      } else {
        toast.error('Failed to cleanup reviews');
      }
    } catch {
      toast.error('Failed to cleanup reviews');
    } finally {
      setIsCleaningUp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">AI Code Review</h2>
              <p className="text-muted-foreground text-sm">
                Comprehensive analysis with security, bugs, and quality insights
              </p>
            </div>
            <Button
              onClick={handleGenerateReview}
              disabled={isGenerating || review?.status === 'IN_PROGRESS'}
              size="sm"
                 className="ml-auto bg-sky-500 text-white hover:bg-sky-600"
            >
              {isGenerating || review?.status === 'IN_PROGRESS' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4 mr-2"  />
                  {review ? 'New Review' : 'Start Review'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* In Progress Alert */}
        {review?.status === 'IN_PROGRESS' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Review in Progress</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Your code is being analyzed. This may take a few moments...</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCleanup}
                disabled={isCleaningUp}
              >
                {isCleaningUp ? 'Cleaning...' : 'Cancel & Cleanup'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Failed Alert */}
        {review?.status === 'FAILED' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Review Failed</AlertTitle>
            <AlertDescription>
              {review.summary || 'The review process encountered an error. Please try again.'}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleGenerateReview}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* No Review Yet */}
        {!review && !isGenerating && (
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <FileSearch className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle>No Review Available</CardTitle>
              <CardDescription>
                Generate your first code review to get AI-powered insights about your project.
                Make sure you have generated some code first using the chat.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <Button onClick={handleGenerateReview} size="lg"   className="ml-auto bg-sky-500 text-white hover:bg-sky-600"
              >
                <FileSearch className="w-4 h-4 mr-2" />
                Start Code Review
              </Button>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Use the chat to generate code first, then come back here to review it
              </p>
            </CardContent>
          </Card>
        )}

        {/* Review Content */}
        {review && review.status === 'COMPLETED' && (
          <div className="space-y-6">
            {/* Overview Section */}
            <ReviewOverview review={review} />

            {/* Summary */}
            {review.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{review.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Diagrams */}
            {(review.architectureDiagram || review.complexityGraph) && (
              <div className="grid gap-6 grid-cols-1">
                {review.architectureDiagram && (
                  <DiagramViewer
                    diagram={review.architectureDiagram}
                    title="Architecture Diagram"
                  />
                )}
                {review.complexityGraph && (
                  <DiagramViewer
                    diagram={review.complexityGraph}
                    title="Complexity Analysis"
                  />
                )}
              </div>
            )}

            {/* Issues List */}
            {review.issues && review.issues.length > 0 && (
              <IssuesList issues={review.issues} />
            )}

            {/* Files Analysis */}
            {review.files && review.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Files Analyzed</CardTitle>
                  <CardDescription>
                    Detailed analysis of {review.files.length} files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {review.files.map((file: {
                      id: string;
                      filePath: string;
                      language?: string | null;
                      linesOfCode: number;
                      complexity: number;
                      score?: number | null;
                      issues?: unknown[];
                    }) => (
                      <div
                        key={file.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <code className="text-sm font-mono">{file.filePath}</code>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{file.language || 'Unknown'}</span>
                              <span>•</span>
                              <span>{file.linesOfCode} lines</span>
                              <span>•</span>
                              <span>Complexity: {file.complexity}</span>
                              {file.issues && Array.isArray(file.issues) && file.issues.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-600 font-medium">
                                    {file.issues.length} issues
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {file.score !== null && (
                            <div className="text-right">
                              <div className="text-2xl font-bold">{file.score}</div>
                              <div className="text-xs text-muted-foreground">Score</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
