'use client';


import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Brain,
  CheckCircle2,
  GitBranch,
  Layers,
  ListTodo,
  Network,
  TrendingUp,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStore, getPhaseProgress } from '@/lib/store';
import { techStackToItems } from '@/lib/types';
import { cn } from '@/lib/utils';

const QUICK_LINKS = [
  { label: 'AI Analysis', href: 'analysis', icon: Brain, desc: 'View project breakdown' },
  { label: 'Tech Stack', href: 'tech-stack', icon: Layers, desc: 'Recommended technologies' },
  { label: 'Roadmap', href: 'roadmap', icon: GitBranch, desc: 'Development phases' },
  { label: 'Tasks', href: 'tasks', icon: ListTodo, desc: 'Manage your tasks' },
  { label: 'System Design', href: 'architecture', icon: Network, desc: 'Architecture canvas' },
];

const statusBadgeClass: Record<string, string> = {
  Completed: 'bg-chart-2/15 text-chart-2',
  'In Progress': 'bg-chart-1/15 text-chart-1',
  'Not Started': 'bg-muted text-muted-foreground',
  Blocked: 'bg-destructive/15 text-destructive',
};

export default function OverviewPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  if (!project) return notFound();

  const completedTasks = project.tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = project.tasks.filter((t) => t.status === 'In Progress').length;
  const totalTasks = project.tasks.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        <p className="mt-1 text-muted-foreground">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{project.type}</Badge>
          <Badge variant="outline">{project.experienceLevel}</Badge>
          <Badge variant="secondary" className={statusBadgeClass[project.status]}>
            {project.status}
          </Badge>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold">{project.progress}%</p>
            <Progress value={project.progress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Completed Tasks</p>
              <CheckCircle2 className="h-4 w-4 text-chart-2" />
            </div>
            <p className="mt-2 text-3xl font-bold">{completedTasks}</p>
            <p className="mt-1 text-xs text-muted-foreground">of {totalTasks} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <Clock className="h-4 w-4 text-chart-1" />
            </div>
            <p className="mt-2 text-3xl font-bold">{inProgressTasks}</p>
            <p className="mt-1 text-xs text-muted-foreground">tasks active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Current Phase</p>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 truncate text-sm font-semibold">{project.currentPhase}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase {project.phases.findIndex((p) => p.title === project.currentPhase) + 1} of{' '}
              {project.phases.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Quick Access</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={`/projects/${id}/${link.href}`}>
                <Card className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{link.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Phase overview */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Development Phases</h2>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {project.phases.map((phase, idx) => {
              const progress = getPhaseProgress(project, phase.id);
              const phaseTaskCount = project.tasks.filter((t) => t.phaseId === phase.id).length;
              return (
                <Link
                  key={phase.id}
                  href={`/projects/${id}/roadmap`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-sm">{phase.title}</p>
                      <Badge
                        variant="secondary"
                        className={cn('shrink-0 text-[10px]', statusBadgeClass[phase.status])}
                      >
                        {phase.status}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {phaseTaskCount} tasks
                    </p>
                  </div>
                  <div className="hidden w-32 sm:block">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="mt-1 h-1.5" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Tech stack preview */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Technology Stack</h2>
        <div className="flex flex-wrap gap-2">
          {techStackToItems(project.techStack).map((tech) => (
            <Badge key={tech.id} variant="outline" className="gap-1.5 py-1.5">
              <span className="text-muted-foreground">{tech.category}:</span>
              <span className="font-medium">{tech.technology}</span>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
