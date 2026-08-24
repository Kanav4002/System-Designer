'use client';


import { notFound } from 'next/navigation';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  GitBranch,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStore, getPhaseProgress } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function ProgressPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  if (!project) return notFound();

  const completedTasks = project.tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = project.tasks.filter((t) => t.status === 'In Progress').length;
  const notStartedTasks = project.tasks.filter((t) => t.status === 'Not Started').length;
  const blockedTasks = project.tasks.filter((t) => t.status === 'Blocked').length;
  const totalTasks = project.tasks.length;

  const phaseChartData = project.phases.map((phase, idx) => ({
    name: `P${idx + 1}`,
    label: phase.title,
    progress: getPhaseProgress(project, phase.id),
    tasks: project.tasks.filter((t) => t.phaseId === phase.id).length,
  }));

  const recentCompleted = project.tasks
    .filter((t) => t.status === 'Completed')
    .reverse()
    .slice(0, 5);

  const statusDistribution = [
    { name: 'Completed', value: completedTasks, fill: 'hsl(var(--chart-2))' },
    { name: 'In Progress', value: inProgressTasks, fill: 'hsl(var(--chart-1))' },
    { name: 'Not Started', value: notStartedTasks, fill: 'hsl(var(--muted-foreground))' },
    { name: 'Blocked', value: blockedTasks, fill: 'hsl(var(--destructive))' },
  ];

  const radialData = [{ name: 'progress', value: project.progress, fill: 'hsl(var(--chart-1))' }];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Progress Tracking</h1>
      </div>

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Overall</p>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-3xl font-bold">{project.progress}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Completed</p>
              <CheckCircle2 className="h-4 w-4 text-chart-2" />
            </div>
            <p className="mt-2 text-3xl font-bold">{completedTasks}</p>
            <p className="text-xs text-muted-foreground">of {totalTasks} tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <Clock className="h-4 w-4 text-chart-1" />
            </div>
            <p className="mt-2 text-3xl font-bold">{inProgressTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Current Phase</p>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 truncate text-sm font-semibold">{project.currentPhase}</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall radial + status distribution */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Overall Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mx-auto h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={radialData}
                  startAngle={90}
                  endAngle={90 - 360}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    background={{ fill: 'hsl(var(--muted))' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{project.progress}%</span>
                <span className="text-xs text-muted-foreground">complete</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusDistribution.map((status) => {
                const pct = totalTasks > 0 ? Math.round((status.value / totalTasks) * 100) : 0;
                return (
                  <div key={status.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: status.fill }}
                        />
                        {status.name}
                      </span>
                      <span className="text-muted-foreground">
                        {status.value} ({pct}%)
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase progress bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Progress by Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={phaseChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value}%`, 'Progress']}
                labelFormatter={(label: string) => {
                  const item = phaseChartData.find((d) => d.name === label);
                  return item?.label || label;
                }}
              />
              <Bar dataKey="progress" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Phase legend */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {project.phases.map((phase, idx) => {
              const progress = getPhaseProgress(project, phase.id);
              return (
                <div key={phase.id} className="flex items-center gap-2 text-xs">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                    {idx + 1}
                  </span>
                  <span className="flex-1 truncate">{phase.title}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent completed tasks */}
      {recentCompleted.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recently Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentCompleted.map((task) => {
                const phase = project.phases.find((p) => p.id === task.phaseId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-chart-2" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      {phase && (
                        <p className="text-xs text-muted-foreground">{phase.title}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {task.estimatedTime}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
