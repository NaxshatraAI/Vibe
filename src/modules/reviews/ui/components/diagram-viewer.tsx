'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiagramViewerProps {
  diagram: string;
  title: string;
}

export function DiagramViewer({ diagram, title }: DiagramViewerProps) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const fullscreenDiagramRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenDiagramSvg, setFullscreenDiagramSvg] = useState<string>('');
  const [zoom, setZoom] = useState(100);

  // When dialog opens, increase zoom to 150% for better visibility
  useEffect(() => {
    if (isFullscreen) {
      setZoom(150);
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (diagramRef.current && diagram) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
      });

      const renderDiagram = async () => {
        try {
          const { svg } = await mermaid.render(`mermaid-${Date.now()}`, diagram);
          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
            // Store SVG for fullscreen dialog
            setFullscreenDiagramSvg(svg);
          }
        } catch (error) {
          console.error('Error rendering diagram:', error);
          if (diagramRef.current) {
            diagramRef.current.innerHTML = '<p class="text-red-500">Failed to render diagram</p>';
          }
        }
      };

      renderDiagram();
    }
  }, [diagram]);

  useEffect(() => {
    if (!isFullscreen || !fullscreenDiagramRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const direction = e.deltaY > 0 ? -1 : 1;
      const zoomStep = 10;
      setZoom(prevZoom => {
        const newZoom = Math.max(50, Math.min(300, prevZoom + direction * zoomStep));
        
        if (fullscreenDiagramRef.current) {
          const contentDiv = fullscreenDiagramRef.current.querySelector('svg') as SVGElement;
          if (contentDiv) {
            contentDiv.style.transform = `scale(${newZoom / 100})`;
            contentDiv.style.transformOrigin = 'center center';
            contentDiv.style.transition = 'transform 0.1s ease-out';
          }
        }
        
        return newZoom;
      });
    };

    const diagramContainer = fullscreenDiagramRef.current;
    diagramContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => diagramContainer.removeEventListener('wheel', handleWheel);
  }, [isFullscreen]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{title}</CardTitle>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title="Click to expand"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </CardHeader>
        <CardContent>
          <div
            ref={diagramRef}
            className="flex items-center justify-center p-6 bg-muted rounded-lg overflow-auto custom-scrollbar min-h-[700px] cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => setIsFullscreen(true)}
          />
        </CardContent>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] flex flex-col p-0">
          <div className="p-4 border-b flex items-center justify-between gap-4 pr-12">
            <DialogTitle className="text-lg">{title}</DialogTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(prev => Math.max(50, prev - 10))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-12 text-center">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(prev => Math.min(300, prev + 10))}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(150)}
              >
                Reset
              </Button>
            </div>
          </div>
          <div 
            ref={fullscreenDiagramRef}
            className="flex-1 overflow-auto custom-scrollbar bg-muted rounded-lg m-4 flex items-center justify-center"
          >
            <div
              dangerouslySetInnerHTML={{ __html: fullscreenDiagramSvg }}
              className="flex items-center justify-center w-full h-full p-4"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
