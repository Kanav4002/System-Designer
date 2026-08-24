'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Settings, Trash2, AlertTriangle, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { techStackToItems } from '@/lib/types';

export default function SettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const deleteProject = useStore((s) => s.deleteProject);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!project) return notFound();

  const handleDelete = () => {
    deleteProject(id);
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Project info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{project.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{project.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Experience Level</p>
              <p className="font-medium">{project.experienceLevel}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="secondary">{project.status}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(project.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {new Date(project.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Description</p>
            <p className="mt-1 text-sm">{project.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-2xl font-bold">{project.phases.length}</p>
              <p className="text-xs text-muted-foreground">Phases</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{project.tasks.length}</p>
              <p className="text-xs text-muted-foreground">Tasks</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{techStackToItems(project.techStack).length}</p>
              <p className="text-xs text-muted-foreground">Technologies</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{project.archNodes.length}</p>
              <p className="text-xs text-muted-foreground">Architecture Nodes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div>
              <p className="font-medium text-sm">Delete this project</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                This will permanently remove all data including tasks, roadmap, and architecture.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <p>
              This project was generated by AI Project System Designer. The tech stack,
              roadmap, tasks, and architecture are all AI-generated based on your project
              description. You can modify anything to fit your needs.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Project?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone
              and all project data will be permanently lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
