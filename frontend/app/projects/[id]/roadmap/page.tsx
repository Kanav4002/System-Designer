'use client';


import { notFound } from 'next/navigation';
import { GitBranch, Circle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStore, getPhaseProgress } from '@/lib/store';
import { cn } from '@/lib/utils';

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

export default function RoadmapPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  if (!project) return notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Project Roadmap</h1>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-4">
          {project.phases.map((phase, idx) => {
            const config = phaseStatusConfig[phase.status];
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
