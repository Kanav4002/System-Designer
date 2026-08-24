'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import {
  GitBranch,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/lib/store';
import { Roadmap, RoadmapPhase } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const phaseStatusConfig = {
  Completed: { icon: CheckCircle2, color: 'text-chart-2', badge: 'bg-chart-2/15 text-chart-2' },
  'In Progress': { icon: Clock, color: 'text-chart-1', badge: 'bg-chart-1/15 text-chart-1' },
  'Not Started': { icon: Circle, color: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground' },
  Blocked: { icon: AlertCircle, color: 'text-destructive', badge: 'bg-destructive/15 text-destructive' },
};

const difficultyColors: Record<string, string> = {
  Easy: 'bg-chart-2/15 text-chart-2',
  Medium: 'bg-chart-3/15 text-chart-3',
  Hard: 'bg-chart-1/15 text-chart-1',
  Expert: 'bg-destructive/15 text-destructive',
};

function mapTaskStatus(status: string): 'Completed' | 'In Progress' | 'Not Started' | 'Blocked' {
  switch (status) {
    case 'completed': return 'Completed';
    case 'in_progress': return 'In Progress';
    case 'blocked': return 'Blocked';
    default: return 'Not Started';
  }
}

export default function RoadmapPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const fetchRoadmap = useStore((s) => s.fetchRoadmap);
  const generateRoadmap = useStore((s) => s.generateRoadmap);

  const [generating, setGenerating] = useState(false);

  if (!project) return notFound();

  const roadmap: Roadmap | undefined = project.roadmap;
  const hasRoadmap = roadmap && roadmap.phases && roadmap.phases.length > 0;

  useEffect(() => {
    if (!hasRoadmap) {
      fetchRoadmap(id);
    }
  }, [id, hasRoadmap, fetchRoadmap]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateRoadmap(id);
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (!hasRoadmap && !project.roadmapId) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Project Roadmap</h1>
          </div>
          <Button onClick={handleGenerate} disabled={false}>
            <Zap className="mr-2 h-4 w-4" />
            Generate Roadmap
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <GitBranch className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold">No roadmap generated yet</h3>
            <p className="mb-6 text-sm text-muted-foreground max-w-md">
              Generate an AI-powered development roadmap based on your project details,
              analysis, and tech stack.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (generating && !hasRoadmap) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Project Roadmap</h1>
          </div>
          <Button variant="outline" size="sm" disabled>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            Generating...
          </Button>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="mt-4 h-2 w-full" />
                <Skeleton className="mt-2 h-2 w-3/4" />
                <Skeleton className="mt-2 h-2 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Project Roadmap</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                Regenerate
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-4">
          {roadmap?.phases.map((phase: RoadmapPhase, idx: number) => {
            const config = phaseStatusConfig[phase.status];
            const StatusIcon = config.icon;
            const progress = phase.progress || 0;
            const phaseTasks = phase.tasks || [];
            const completedTasks = phase.completedTasks || phaseTasks.filter((t) => mapTaskStatus(t.status) === 'Completed').length;

            return (
              <div key={phase.id} className="relative pl-12">
                {/* Phase number circle */}
                <div
                  className={cn(
                    'absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background',
                    phase.status === 'Completed'
                      ? 'border-chart-2 text-chart-2'
                      : phase.status === 'In Progress'
                        ? 'border-chart-1 text-chart-1'
                        : 'border-border text-muted-foreground'
                  )}
                >
                  <StatusIcon className="h-5 w-5" />
                </div>

                <Card className={cn(
                  'transition-all',
                  phase.status === 'In Progress' && 'border-primary/30 shadow-md'
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Phase {idx + 1}
                          </span>
                          <Badge variant="secondary" className={cn('text-[10px]', config.badge)}>
                            {phase.status}
                          </Badge>
                        </div>
                        <h3 className="mt-1 font-semibold">{phase.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {phase.description}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn('shrink-0 text-xs', difficultyColors[phase.difficulty])}>
                        {phase.difficulty}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {completedTasks} / {phaseTasks.length} tasks completed
                        </span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Task preview */}
                    <div className="mt-4 space-y-1">
                      {phaseTasks.slice(0, 3).map((task) => {
                        const mappedStatus = mapTaskStatus(task.status);
                        return (
                          <div
                            key={task._id}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs"
                          >
                            {mappedStatus === 'Completed' ? (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-chart-2" />
                            ) : mappedStatus === 'In Progress' ? (
                              <Clock className="h-3.5 w-3.5 shrink-0 text-chart-1" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            )}
                            <span className={cn(
                              'truncate',
                              mappedStatus === 'Completed' && 'text-muted-foreground line-through'
                            )}>
                              {task.title}
                            </span>
                          </div>
                        );
                      })}
                      {phaseTasks.length > 3 && (
                        <p className="px-2 text-xs text-muted-foreground">
                          +{phaseTasks.length - 3} more tasks
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}