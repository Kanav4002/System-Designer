'use client';


import { notFound } from 'next/navigation';
import {
  Brain,
  Users,
  CheckCircle2,
  Shield,
  Gauge,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const complexityColors: Record<string, string> = {
  Low: 'bg-chart-2/15 text-chart-2',
  Medium: 'bg-chart-3/15 text-chart-3',
  High: 'bg-chart-1/15 text-chart-1',
  'Very High': 'bg-destructive/15 text-destructive',
};

export default function AnalysisPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  if (!project) return notFound();

  const a = project.analysis;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">AI Project Analysis</h1>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Project Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{a.summary}</p>
        </CardContent>
      </Card>

      {/* Complexity + Phases */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Gauge className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Technical Complexity</p>
                <Badge variant="secondary" className={cn('mt-1', complexityColors[a.technicalComplexity])}>
                  {a.technicalComplexity}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ListChecks className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Phases</p>
                <p className="mt-1 text-2xl font-bold">{a.estimatedPhases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Main Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {a.mainFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-lg border border-border p-3"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-chart-2" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Target Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {a.targetUsers.map((user, idx) => (
              <Badge key={idx} variant="secondary" className="py-1.5">
                {user}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Functional requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Functional Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {a.functionalRequirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {req}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Non-functional requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            Non-Functional Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {a.nonFunctionalRequirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-3" />
                {req}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
