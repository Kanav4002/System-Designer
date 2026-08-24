'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Wand2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { getTechOptions } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { TechCategory } from '@/lib/types';

const PROJECT_TYPES = [
  'Web App',
  'Mobile App',
  'SaaS Platform',
  'E-Commerce',
  'API / Backend',
  'Desktop App',
  'Chrome Extension',
  'Other',
];

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

const TECH_CATEGORIES: { key: TechCategory; label: string; technologies: string[] }[] = [
  { key: 'Frontend', label: 'Frontend', technologies: getTechOptions('Frontend') },
  { key: 'Backend', label: 'Backend', technologies: getTechOptions('Backend') },
  { key: 'Database', label: 'Database', technologies: getTechOptions('Database') },
  { key: 'Other Services', label: 'Other Services', technologies: getTechOptions('Other Services') },
];

export default function CreateProjectPage() {
  const router = useRouter();
  const createProject = useStore((s) => s.createProject);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Web App');
  const [experienceLevel, setExperienceLevel] =
    useState<(typeof EXPERIENCE_LEVELS)[number]>('Intermediate');
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [selectedTech, setSelectedTech] = useState<
    Record<TechCategory, string | undefined>
  >({
    Frontend: undefined,
    Backend: undefined,
    Database: undefined,
    'Other Services': undefined,
    DevOps: undefined,
    Mobile: undefined,
  });
  const [extraTech, setExtraTech] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const canSubmit = name.trim() && description.trim();

  const toggleExtraTech = (tech: string) => {
    setExtraTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleGenerate = async () => {
    if (!canSubmit) return;
    setGenerating(true);

    const selectedTechList =
      mode === 'manual'
        ? [
            ...(selectedTech.Frontend ? [{ category: 'Frontend' as TechCategory, technology: selectedTech.Frontend }] : []),
            ...(selectedTech.Backend ? [{ category: 'Backend' as TechCategory, technology: selectedTech.Backend }] : []),
            ...(selectedTech.Database ? [{ category: 'Database' as TechCategory, technology: selectedTech.Database }] : []),
            ...extraTech.map((t) => ({ category: 'Other Services' as TechCategory, technology: t })),
          ]
        : undefined;

    try {
      const id = await createProject({
        name,
        description,
        type,
        experienceLevel,
        mode,
        selectedTech: selectedTechList,
      });
      router.push(`/projects/${id}/overview`);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Create New Project</h1>
          <p className="mt-1 text-muted-foreground">
            Describe your idea and let AI generate a complete development plan
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Food Delivery App"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Project Idea / Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project idea in detail. What does it do? Who is it for? What features do you need?"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The more detail you provide, the better the AI recommendations will be
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Project Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select
                    value={experienceLevel}
                    onValueChange={(v) =>
                      setExperienceLevel(v as (typeof EXPERIENCE_LEVELS)[number])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setMode('ai')}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-4 text-left transition-all',
                    mode === 'ai'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border hover:border-primary/30'
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Let AI Choose</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      AI analyzes your project and recommends the best stack
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-4 text-left transition-all',
                    mode === 'manual'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border hover:border-primary/30'
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Choose Manually</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Select technologies yourself from the library
                    </p>
                  </div>
                </button>
              </div>

              {mode === 'manual' && (
                <div className="mt-6 space-y-5 animate-fade-in">
                  {TECH_CATEGORIES.map((cat) => (
                    <div key={cat.key} className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {cat.label}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {cat.technologies.map((tech) => {
                          const isSelected =
                            cat.key === 'Other Services'
                              ? extraTech.includes(tech)
                              : selectedTech[cat.key] === tech;
                          return (
                            <button
                              key={tech}
                              onClick={() => {
                                if (cat.key === 'Other Services') {
                                  toggleExtraTech(tech);
                                } else {
                                  setSelectedTech((prev) => ({
                                    ...prev,
                                    [cat.key]: isSelected ? undefined : tech,
                                  }));
                                }
                              }}
                              className={cn(
                                'rounded-md border px-3 py-1.5 text-sm transition-all',
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border hover:border-primary/30 hover:bg-accent'
                              )}
                            >
                              {tech}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {extraTech.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-muted/30 p-3">
                      <span className="text-xs text-muted-foreground">Selected services:</span>
                      {extraTech.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!canSubmit || generating}
              className="min-w-[200px]"
            >
              {generating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate My Project Plan
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
