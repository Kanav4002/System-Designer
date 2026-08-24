'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Boxes,
  Brain,
  CheckCircle2,
  Code2,
  Cpu,
  GitBranch,
  Layers,
  ListTodo,
  LogOut,
  MessageSquare,
  Network,
  Rocket,
  Sparkles,
  Target,
  User,
  Workflow,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Describe your idea and get a complete breakdown of features, requirements, and technical complexity.',
  },
  {
    icon: Layers,
    title: 'Smart Tech Stack',
    description: 'Get tailored technology recommendations with reasoning and alternatives for every choice.',
  },
  {
    icon: GitBranch,
    title: 'Visual Roadmap',
    description: 'A phased development roadmap with progress tracking, difficulty ratings, and dependencies.',
  },
  {
    icon: ListTodo,
    title: 'Task Management',
    description: 'Every phase breaks down into actionable tasks with priorities, estimates, and status tracking.',
  },
  {
    icon: Network,
    title: 'System Architecture',
    description: 'An interactive node-based canvas to design, connect, and visualize your system components.',
  },
  {
    icon: MessageSquare,
    title: 'AI Project Assistant',
    description: 'A context-aware chat assistant that understands your project and helps you make decisions.',
  },
];

const steps = [
  {
    icon: Sparkles,
    title: 'Describe Your Idea',
    description: 'Enter your project concept in plain language. No technical expertise required.',
  },
  {
    icon: Cpu,
    title: 'AI Generates the Plan',
    description: 'Get a tech stack, roadmap, tasks, and architecture generated automatically.',
  },
  {
    icon: Target,
    title: 'Track Your Progress',
    description: 'Complete tasks and watch your project progress update in real-time.',
  },
  {
    icon: Rocket,
    title: 'Ship Faster',
    description: 'Follow the plan, ask the AI assistant for guidance, and build with confidence.',
  },
];

const architecturePreview = [
  { label: 'Next.js Frontend', icon: Code2, top: '5%', left: '35%' },
  { label: 'API Gateway', icon: Network, top: '25%', left: '35%' },
  { label: 'Auth Service', icon: Boxes, top: '45%', left: '12%' },
  { label: 'API Server', icon: Cpu, top: '45%', left: '35%' },
  { label: 'Redis Cache', icon: Zap, top: '45%', left: '58%' },
  { label: 'PostgreSQL', icon: Layers, top: '65%', left: '20%' },
  { label: 'File Storage', icon: Boxes, top: '65%', left: '50%' },
  { label: 'Stripe Payments', icon: Code2, top: '65%', left: '75%' },
];

export default function Home() {
  const router = useRouter();
  const { user, logout, fetchMe } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
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
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Project
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

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-dots opacity-40" />
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <Sparkles className="h-3 w-3" />
            AI-Powered Project Planning
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Turn Your Project Idea Into a{' '}
            <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              Complete Development Plan
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            Describe your idea and let AI help you choose the right tech stack, create a
            roadmap, organize tasks, track progress, and design your system architecture.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/projects/new">
                <Sparkles className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">
                View Dashboard
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Architecture Preview */}
      <section className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Visualize Your System Architecture
            </h2>
            <p className="mt-3 text-muted-foreground">
              AI generates an interactive, editable node-based diagram of your entire system
            </p>
          </div>
          <div className="relative mx-auto h-[400px] max-w-3xl rounded-xl border border-border bg-card/50 bg-dots">
            {architecturePreview.map((node, idx) => {
              const Icon = node.icon;
              return (
                <div
                  key={idx}
                  className="absolute flex w-40 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md animate-fade-in"
                  style={{ top: node.top, left: node.left, animationDelay: `${idx * 80}ms` }}
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate text-xs font-medium">{node.label}</span>
                </div>
              );
            })}
            {/* Connection lines (SVG) */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6" fill="hsl(var(--muted-foreground))" opacity="0.4" />
                </marker>
              </defs>
              <line x1="50%" y1="12%" x2="50%" y2="28%" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" markerEnd="url(#arrowhead)" />
              <line x1="42%" y1="32%" x2="22%" y2="48%" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" markerEnd="url(#arrowhead)" />
              <line x1="50%" y1="32%" x2="50%" y2="48%" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" markerEnd="url(#arrowhead)" />
              <line x1="58%" y1="32%" x2="68%" y2="48%" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" markerEnd="url(#arrowhead)" />
              <line x1="30%" y1="52%" x2="30%" y2="68%" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" markerEnd="url(#arrowhead)" />
              <line x1="50%" y1="52%" x2="60%" y2="68%" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" markerEnd="url(#arrowhead)" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Everything You Need to Plan and Build
            </h2>
            <p className="mt-3 text-muted-foreground">
              One intelligent workspace that connects your idea to execution
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground">From idea to execution in four steps</p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative">
                  {idx < steps.length - 1 && (
                    <div className="absolute left-[60%] top-8 hidden h-px w-[80%] bg-border md:block" />
                  )}
                  <div className="relative flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      Step {idx + 1}
                    </div>
                    <h3 className="mb-2 font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-2xl border border-border bg-card p-12">
            <Workflow className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Ready to Plan Your Next Project?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start for free and get a complete development plan in seconds
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/projects/new">
                <Sparkles className="mr-2 h-4 w-4" />
                Create Your First Project
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Project System Designer — Built with AI
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/projects/new" className="hover:text-foreground transition-colors">Create</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
