'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import {
  Layers,
  Plus,
  X,
  Check,
  RefreshCw,
  Lightbulb,
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
import { getTechOptions, findTech } from '@/lib/mock-data';
import type { TechCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

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

export default function TechStackPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const replaceTech = useStore((s) => s.replaceTech);
  const addTech = useStore((s) => s.addTech);
  const removeTech = useStore((s) => s.removeTech);

  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [replaceWith, setReplaceWith] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<TechCategory>('Frontend');
  const [newTech, setNewTech] = useState('');

  if (!project) return notFound();

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

  const groupedByCategory = ALL_CATEGORIES.map((cat) => ({
    category: cat,
    items: project.techStack.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);

  const currentReplaceTech = project.techStack.find((t) => t.id === replacingId);
  const replaceOptions = currentReplaceTech
    ? getTechOptions(currentReplaceTech.category)
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Tech Stack</h1>
        </div>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Technology
        </Button>
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
                      {tech.alternatives.map((alt) => (
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
                  {getTechOptions(newCategory).map((opt) => (
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
