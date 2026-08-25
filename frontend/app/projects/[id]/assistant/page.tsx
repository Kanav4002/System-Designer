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
import { chatApi } from '@/lib/api';

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

async function sendChatMessage(projectId: string, message: string): Promise<string> {
  try {
    const data = await chatApi.sendMessage(projectId, message);
    return data.data?.message?.content || 'No response received';
  } catch (error) {
    console.error('Chat error:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}
function Markdown({ content }: { content: string }) {
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-disc pl-6 space-y-1 my-2 text-sm">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('### ')) {
      flushList(index);
      renderedElements.push(
        <h4 key={index} className="text-sm font-semibold mt-4 mb-2">
          {parseInlineMarkdown(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList(index);
      renderedElements.push(
        <h3 key={index} className="text-base font-semibold mt-4 mb-2">
          {parseInlineMarkdown(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      inList = true;
      listItems.push(
        <li key={`li-${index}`} className="leading-relaxed text-sm">
          {parseInlineMarkdown(trimmed.slice(2))}
        </li>
      );
    } else if (trimmed === '') {
      flushList(index);
      renderedElements.push(<div key={`space-${index}`} className="h-2" />);
    } else {
      if (inList) {
        // If we are currently in list mode but this line doesn't start with * or -,
        // let's flush the list unless it's empty.
        flushList(index);
      }
      renderedElements.push(
        <p key={index} className="text-sm leading-relaxed mb-2">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  });

  flushList(lines.length);

  return <div className="space-y-1">{renderedElements}</div>;
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

    sendChatMessage(id, content).then((response) => {
      addChatMessage(id, 'assistant', response);
      setThinking(false);
    }).catch(() => {
      addChatMessage(id, 'assistant', 'Sorry, I encountered an error. Please try again.');
      setThinking(false);
    });
  };

  if (!project) return notFound();

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
                {msg.role === 'assistant' ? (
                  <Markdown content={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                )}
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
