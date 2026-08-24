'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import {
  Layers,
  Plus,
  X,
  Check,
  RefreshCw,
  Lightbulb,
  Zap,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import { getTechOptions } from '@/lib/mock-data';
import type { TechCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORY_ICONS: Record<string, string> = {
  Frontend: '🎨',
  Backend: '⚙️',
  Database: '🗄️',
  'Other Services': '🔌',
  DevOps: '🚀',
  Mobile: '📱',
};

const ALL_CATEGORIES: TechCategory[] = [
  'Frontend',
  'Backend',
  'Database',
  'Other Services',
  'DevOps',
  'Mobile',
];

// Convert backend TechStack format to frontend TechItem[] for display
function convertTechStack(techStack: any): any[] {
  if (!techStack) return [];
  const items: any[] = [];
  const categories: { key: string; label: TechCategory }[] = [
    { key: 'frontend', label: 'Frontend' },
    { key: 'backend', label: 'Backend' },
    { key: 'database', label: 'Database' },
    { key: 'authentication', label: 'Other Services' },
    { key: 'otherServices', label: 'Other Services' },
  ];

  categories.forEach(({ key, label }) => {
    const categoryItems = techStack[key] || [];
    categoryItems.forEach((item: any) => {
      items.push({
        id: `${key}-${item.name}`,
        category: label,
        technology: item.name,
        reason: item.reason,
        alternatives: item.alternatives || [],
      });
    });
  });
  return items;
}

export default function TechStackPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const fetchTechStack = useStore((s) => s.fetchTechStack);
  const generateTechStack = useStore((s) => s.generateTechStack);
  const replaceTech = useStore((s) => s.replaceTech);
  const addTech = useStore((s) => s.addTech);
  const removeTech = useStore((s) => s.removeTech);

  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [replaceWith, setReplaceWith] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<TechCategory>('Frontend');
  const [newTech, setNewTech] = useState('');
  const [generating, setGenerating] = useState(false);

  if (!project) return notFound();

  const techStack = project.techStack as any;
  const hasTechStack = techStack && (techStack.frontend?.length || techStack.backend?.length || techStack.database?.length || techStack.authentication?.length || techStack.otherServices?.length);

  useEffect(() => {
    if (!hasTechStack) {
      fetchTechStack(id);
    }
  }, [id, hasTechStack, fetchTechStack]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateTechStack(id);
    } catch (error) {
      console.error('Failed to generate tech stack:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleReplace = () => {
    if (!replacingId || !replaceWith) return;
    replaceTech(id, replacingId, replaceWith);
    setReplacingId(null);
    setReplaceWith('');
  };

  const handleAdd = () => {
    if (!newTech) return;
    addTech(id, newCategory, newTech);
    setAddDialogOpen(false);
    setNewTech('');
  };

  const displayTechStack = hasTechStack ? convertTechStack(techStack) : [];

  const groupedByCategory = ALL_CATEGORIES.map((cat) => ({
    category: cat,
    items: displayTechStack.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);

  const currentReplaceTech = displayTechStack.find((t) => t.id === replacingId);
  const replaceOptions = currentReplaceTech
    ? getTechOptions(currentReplaceTech.category)
    : [];

  if (!hasTechStack && !generating) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Tech Stack</h1>
          </div>
          <Button onClick={handleGenerate} disabled={generating}>
            <Zap className="mr-2 h-4 w-4" />
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Tech Stack'
            )}
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Layers className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold">No tech stack generated yet</h3>
            <p className="mb-6 text-sm text-muted-foreground max-w-md">
              Generate an AI-recommended technology stack based on your project details
              and analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Tech Stack</h1>
          </div>
          <Button variant="outline" size="sm" disabled>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            Generating...
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-1 h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-8 w-full" />
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
          <Layers className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Tech Stack</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Regenerate
          </Button>
          <Button size="sm" onClick={() => setAddDialogOpen(true)} disabled={generating}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Technology
          </Button>
        </div>
      </div>

      {groupedByCategory.map(({ category, items }) => (
        <div key={category}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <span>{CATEGORY_ICONS[category]}</span>
            {category}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((tech) => (
              <Card key={tech.id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{tech.technology}</CardTitle>
                    <button
                      onClick={() => removeTech(id, tech.id)}
                      className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Badge variant="outline" className="w-fit text-xs">
                    {tech.category}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
                    <p className="text-sm text-muted-foreground">{tech.reason}</p>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                      Alternatives
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tech.alternatives.map((alt: string) => (
                        <button
                          key={alt}
                          onClick={() => {
                            setReplacingId(tech.id);
                            setReplaceWith(alt);
                          }}
                          className="rounded-md border border-border px-2 py-1 text-xs transition-colors hover:border-primary/30 hover:bg-accent"
                        >
                          {alt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setReplacingId(tech.id)}
                  >
                    <RefreshCw className="mr-1.5 h-3 w-3" />
                    Replace
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Replace Dialog */}
      <Dialog open={!!replacingId} onOpenChange={(open) => !open && setReplacingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Technology</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Current</Label>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                {currentReplaceTech?.technology}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Replace with</Label>
              <Select value={replaceWith} onValueChange={setReplaceWith}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a technology" />
                </SelectTrigger>
                <SelectContent>
                  {replaceOptions
                    .filter((opt) => opt !== currentReplaceTech?.technology)
                    .map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplacingId(null)}>
              Cancel
            </Button>
            <Button onClick={handleReplace} disabled={!replaceWith}>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Technology</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={newCategory}
                onValueChange={(v) => {
                  setNewCategory(v as TechCategory);
                  setNewTech('');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Technology</Label>
              <Select value={newTech} onValueChange={setNewTech}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a technology" />
                </SelectTrigger>
                <SelectContent>
                  {getTechOptions(newCategory).map((opt: string) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!newTech}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}