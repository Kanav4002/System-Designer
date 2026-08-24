'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  LogOut,
  Plus,
  TrendingUp,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStore, getProjectStats } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const statusColors: Record<string, string> = {
  Planning: 'bg-muted text-muted-foreground',
  'In Progress': 'bg-chart-1/15 text-chart-1',
  Completed: 'bg-chart-2/15 text-chart-2',
  'On Hold': 'bg-chart-3/15 text-chart-3',
};

export default function DashboardPage() {
  const router = useRouter();
  const projects = useStore((s) => s.projects);
  const stats = getProjectStats(projects);
  const recentProjects = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const { user, logout } = useAuth();

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTasks,
      sub: `of ${stats.totalTasks}`,
      icon: CheckCircle2,
    },
    {
      label: 'Overall Progress',
      value: `${stats.overallProgress}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button size="sm" asChild>
              <Link href="/projects/new">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New Project
              </Link>
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" onClick={() => router.push('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/projects/new" onClick={() => router.push('/projects/new')}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Project
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="text-destructive focus:text-destructive"
                    inset
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">
                    Register
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s an overview of your projects and progress
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold">
                      {stat.value}
                      {stat.sub && (
                        <span className="ml-1 text-sm font-normal text-muted-foreground">
                          {stat.sub}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Projects */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Projects</h2>
          <Button size="sm" asChild>
            <Link href="/projects/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create New Project
            </Link>
          </Button>
        </div>

        {recentProjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 font-semibold">No projects yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your first project to get started
              </p>
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}/overview`}>
                <Card className="group h-full cursor-pointer transition-all hover:border-primary/30 hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-base">
                          {project.name}
                        </CardTitle>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn('shrink-0', statusColors[project.status])}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 4).map((tech) => (
                        <Badge key={tech.id} variant="outline" className="text-[10px] font-normal">
                          {tech.technology}
                        </Badge>
                      ))}
                      {project.techStack.length > 4 && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          +{project.techStack.length - 4}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>
                    <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ListTodo className="h-3 w-3" />
                        {project.currentPhase}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(project.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Create card */}
            <Link href="/projects/new">
              <Card className="group flex h-full min-h-[220px] cursor-pointer items-center justify-center border-dashed transition-all hover:border-primary/30 hover:bg-accent/50">
                <CardContent className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="font-medium">Create New Project</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start with a fresh idea
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
