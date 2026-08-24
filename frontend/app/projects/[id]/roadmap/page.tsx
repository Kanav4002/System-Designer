'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { GitBranch, Circle, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useStore, getPhaseProgress } from '@/lib/store';
import { cn } from '@/lib/utils';

const phaseStatusConfig: Record<string, { icon: any; color: string; badge: string }> = {
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

export default function RoadmapPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const fetchRoadmap = useStore((s) => s.fetchRoadmap);
  const generateRoadmap = useStore((s) => s.generateRoadmap);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!project) return;
    if (project.phases.length > 0) {
      setInitialLoading(false);
      return;
    }
    fetchRoadmap(id).finally(() => setInitialLoading(false));
  }, [id, project?.phases.length]);

  if (!project) return notFound();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateRoadmap(id);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Project Roadmap</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (project.phases.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Project Roadmap</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <GitBranch className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No roadmap generated yet</p>
            <p className="text-sm text-muted-foreground">Generate a roadmap to get started with your project plan.</p>
            <Button onClick={handleGenerate} disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Roadmap'
              )}
            </Button>
          </CardContent>
        </Card>
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Regenerate
        </Button>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-4">
          {project.phases.map((phase, idx) => {
            const config = phaseStatusConfig[phase.status] || phaseStatusConfig['Not Started'];
            const StatusIcon = config.icon;
            const progress = getPhaseProgress(project, phase.id);
            const phaseTasks = project.tasks.filter((t) => t.phaseId === phase.id);
            const completedTasks = phaseTasks.filter((t) => t.status === 'Completed').length;

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
                      {phaseTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs"
                        >
                          {task.status === 'Completed' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-chart-2" />
                          ) : task.status === 'In Progress' ? (
                            <Clock className="h-3.5 w-3.5 shrink-0 text-chart-1" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          )}
                          <span className={cn(
                            'truncate',
                            task.status === 'Completed' && 'text-muted-foreground line-through'
                          )}>
                            {task.title}
                          </span>
                        </div>
                      ))}
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
