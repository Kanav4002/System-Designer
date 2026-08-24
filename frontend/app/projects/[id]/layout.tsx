'use client';


import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BarChart3,
  Brain,
  Layers,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Network,
  Settings,
  GitBranch,
  ArrowLeft,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Overview', href: 'overview', icon: LayoutDashboard },
  { label: 'AI Analysis', href: 'analysis', icon: Brain },
  { label: 'Tech Stack', href: 'tech-stack', icon: Layers },
  { label: 'Roadmap', href: 'roadmap', icon: GitBranch },
  { label: 'Tasks', href: 'tasks', icon: ListTodo },
  { label: 'Progress', href: 'progress', icon: BarChart3 },
  { label: 'System Design', href: 'architecture', icon: Network },
  { label: 'AI Assistant', href: 'assistant', icon: MessageSquare },
  { label: 'Settings', href: 'settings', icon: Settings },
];

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const { id } = params;
  const project = useStore((s) => s.projects.find((p) => p.id === id));

  if (!project) return notFound();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/30 md:flex">
        <div className="flex h-16 items-center border-b border-border px-4">
          <Logo />
        </div>

        {/* Project info */}
        <div className="border-b border-border p-4">
          <Link
            href="/dashboard"
            className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            All Projects
          </Link>
          <h2 className="truncate font-semibold text-sm">{project.name}</h2>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {project.description}
          </p>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={`/projects/${id}/${item.href}`}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <Badge variant="secondary" className="w-full justify-center">
            {project.status}
          </Badge>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Logo showText={false} />
            </div>
            <h1 className="truncate text-sm font-semibold">{project.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile nav */}
        <div className="flex shrink-0 overflow-x-auto border-b border-border px-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={`/projects/${id}/${item.href}`}
              className="whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
