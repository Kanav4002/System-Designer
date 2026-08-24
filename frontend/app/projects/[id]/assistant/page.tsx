'use client';

import { useState, useRef, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { MessageSquare, Send, Sparkles, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import type { Project } from '@/lib/types';
import { techStackToItems } from '@/lib/types';
import { cn } from '@/lib/utils';

const SUGGESTED_QUESTIONS = [
  'What should I build next?',
  'Explain this architecture.',
  'Why did you recommend Redis?',
  'Generate tasks for authentication.',
  'How can I improve my database design?',
  'What am I missing?',
  'Simplify this architecture.',
  'Generate API endpoints.',
];

function generateAIResponse(question: string, project: Project): string {
  const lower = question.toLowerCase();
  const completedTasks = project.tasks.filter((t) => t.status === 'Completed');
  const inProgressTasks = project.tasks.filter((t) => t.status === 'In Progress');
  const nextPhase = project.phases.find((p) => p.status === 'Not Started' || p.status === 'In Progress');

  if (lower.includes('build next') || lower.includes('what should i')) {
    const nextTasks = project.tasks
      .filter((t) => t.status === 'Not Started' || t.status === 'In Progress')
      .slice(0, 3);
    return `Based on your current progress (${project.progress}% complete), here's what I recommend focusing on next:\n\n${nextTasks.map((t, i) => `${i + 1}. **${t.title}** — ${t.estimatedTime}, ${t.difficulty} difficulty`).join('\n')}\n\nYou're currently in the "${project.currentPhase}" phase. Completing these tasks will advance your progress significantly.`;
  }

  if (lower.includes('architecture') || lower.includes('explain this')) {
    const nodes = project.archNodes.map((n) => `• **${n.label}** (${n.type}): ${n.description}`).join('\n');
    return `Here's an overview of your system architecture:\n\n${nodes}\n\nThe architecture follows a standard pattern: your frontend communicates with the API server, which handles business logic and connects to the database, cache, and external services. ${project.archEdges.length} connections link these components together.`;
  }

  if (lower.includes('redis') || lower.includes('cache')) {
    const redis = techStackToItems(project.techStack).find((t) => t.technology === 'Redis');
    if (redis) {
      return `**Why Redis?**\n\n${redis.reason}\n\nRedis serves as an in-memory data store in your architecture. It's particularly valuable for this project because:\n\n• **Session management** — fast token validation\n• **Caching hot queries** — reduces database load\n• **Rate limiting** — protects your API from abuse\n• **Real-time features** — pub/sub for live updates\n\nAlternatives include ${redis.alternatives.join(', ')}, but Redis is the most battle-tested choice.`;
    }
    return `Redis isn't currently in your tech stack. Would you like me to explain when you might need it?`;
  }

  if (lower.includes('generate task') || lower.includes('tasks for')) {
    return `Here are some tasks I'd suggest for the next phase:\n\n1. **Set up database migrations** — Create initial schema migrations (4h, Medium)\n2. **Implement CRUD API endpoints** — Build REST endpoints for core entities (8h, Hard)\n3. **Add input validation** — Validate all API requests with proper error handling (3h, Medium)\n4. **Write API integration tests** — Test endpoints with real database (6h, Medium)\n\nYou can add these directly from the Tasks page.`;
  }

  if (lower.includes('database') || lower.includes('improve')) {
    return `Here are some ways to improve your database design:\n\n• **Add indexes** on frequently queried columns (foreign keys, search fields)\n• **Use connection pooling** to handle concurrent requests efficiently\n• **Implement soft deletes** instead of hard deletes for audit trails\n• **Add database constraints** (unique, not null, check) at the schema level\n• **Consider read replicas** if you expect heavy read traffic\n• **Set up automated backups** with point-in-time recovery\n\nYour current database choice (${techStackToItems(project.techStack).find((t) => t.category === 'Database')?.technology || 'PostgreSQL'}) supports all of these patterns well.`;
  }

  if (lower.includes('missing') || lower.includes('what am i')) {
    const hasAuth = techStackToItems(project.techStack).some((t) => t.technology.toLowerCase().includes('auth') || project.archNodes.some((n) => n.type === 'Auth Service'));
    const hasPayment = techStackToItems(project.techStack).some((t) => t.technology === 'Stripe');
    const hasMonitoring = project.tasks.some((t) => t.title.toLowerCase().includes('monitor'));
    const missing: string[] = [];
    if (!hasAuth) missing.push('Authentication service');
    if (!hasPayment && project.description.toLowerCase().includes('payment')) missing.push('Payment integration');
    if (!hasMonitoring) missing.push('Monitoring and error tracking');
    missing.push('API rate limiting', 'Environment variable management', 'Logging strategy');

    return `After reviewing your project, here are some things you might be missing:\n\n${missing.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\nWould you like me to help you plan any of these?`;
  }

  if (lower.includes('simplify')) {
    return `To simplify your architecture, consider:\n\n• **Merge the API Gateway and API Server** if traffic is low — one service is simpler to maintain\n• **Remove the cache layer** initially — add it only when you have performance issues\n• **Use a managed database** (like Supabase) instead of self-hosting PostgreSQL\n• **Start with a monolith** rather than microservices — split later only if needed\n\nRemember: the best architecture is the simplest one that solves your problem. You can always add complexity when scale demands it.`;
  }

  if (lower.includes('api endpoint') || lower.includes('generate api')) {
    return `Here are the key API endpoints for your project:\n\n**Authentication**\n• \`POST /api/auth/register\` — Create a new account\n• \`POST /api/auth/login\` — Log in and receive token\n• \`POST /api/auth/logout\` — Invalidate session\n• \`POST /api/auth/reset-password\` — Request password reset\n\n**Core Resources**\n• \`GET /api/items\` — List with pagination and filters\n• \`POST /api/items\` — Create new item\n• \`GET /api/items/:id\` — Get single item\n• \`PUT /api/items/:id\` — Update item\n• \`DELETE /api/items/:id\` — Delete item\n\n**User Profile**\n• \`GET /api/profile\` — Get current user\n• \`PUT /api/profile\` — Update profile\n\nAll endpoints should use JWT authentication and return JSON with consistent error formats.`;
  }

  return `Great question! Based on your project "${project.name}", you currently have ${project.tasks.length} tasks across ${project.phases.length} phases, with ${completedTasks.length} completed and ${inProgressTasks.length} in progress. Your overall progress is ${project.progress}%.\n\nCould you be more specific about what you'd like to know? You can ask about the tech stack, roadmap, architecture, or any specific aspect of the project.`;
}

export default function AssistantPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const addChatMessage = useStore((s) => s.addChatMessage);

  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [project?.chat, thinking]);

  if (!project) return notFound();

  const handleSend = (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    addChatMessage(id, 'user', content);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const response = generateAIResponse(content, project);
      addChatMessage(id, 'assistant', response);
      setThinking(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-6 py-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">AI Project Assistant</h1>
        <Badge variant="secondary" className="gap-1 text-xs">
          <Sparkles className="h-3 w-3" />
          Context-Aware
        </Badge>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {project.chat.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 animate-fade-in',
                msg.role === 'user' && 'flex-row-reverse'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  msg.role === 'assistant'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <Card
                className={cn(
                  'max-w-[80%] px-4 py-3',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'
                )}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </Card>
            </div>
          ))}

          {thinking && (
            <div className="flex gap-3 animate-fade-in">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <Card className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }} />
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Suggested questions */}
      {project.chat.length <= 1 && !thinking && (
        <div className="shrink-0 border-t border-border px-6 py-4">
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Suggested questions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs transition-all hover:border-primary/30 hover:bg-accent"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-border px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything about your project..."
            className="flex h-11 flex-1 rounded-lg border border-input bg-background px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <Button
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => handleSend()}
            disabled={!input.trim() || thinking}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
