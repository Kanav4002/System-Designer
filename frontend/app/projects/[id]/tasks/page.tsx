'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import {
  ListTodo,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  GripVertical,
  ArrowDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStore, getPhaseProgress } from '@/lib/store';
import type { Task, TaskStatus, TaskPriority, TaskDifficulty } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUS_ICONS: Record<TaskStatus, typeof Circle> = {
  'Not Started': Circle,
  'In Progress': Clock,
  Completed: CheckCircle2,
  Blocked: AlertCircle,
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  'Not Started': 'bg-muted text-muted-foreground',
  'In Progress': 'bg-chart-1/15 text-chart-1',
  Completed: 'bg-chart-2/15 text-chart-2',
  Blocked: 'bg-destructive/15 text-destructive',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  Low: 'bg-muted text-muted-foreground',
  Medium: 'bg-chart-3/15 text-chart-3',
  High: 'bg-chart-1/15 text-chart-1',
  Critical: 'bg-destructive/15 text-destructive',
};

const DIFFICULTY_COLORS: Record<TaskDifficulty, string> = {
  Easy: 'bg-chart-2/15 text-chart-2',
  Medium: 'bg-chart-3/15 text-chart-3',
  Hard: 'bg-chart-1/15 text-chart-1',
  Expert: 'bg-destructive/15 text-destructive',
};

const STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'Completed', 'Blocked'];
const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const DIFFICULTIES: TaskDifficulty[] = ['Easy', 'Medium', 'Hard', 'Expert'];

export default function TasksPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const updateTaskStatus = useStore((s) => s.updateTaskStatus);
  const updateTask = useStore((s) => s.updateTask);
  const addTask = useStore((s) => s.addTask);
  const deleteTask = useStore((s) => s.deleteTask);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addDialogPhase, setAddDialogPhase] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('Not Started');
  const [editPriority, setEditPriority] = useState<TaskPriority>('Medium');
  const [editDifficulty, setEditDifficulty] = useState<TaskDifficulty>('Medium');
  const [editTime, setEditTime] = useState('');

  // Add form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
  const [newDifficulty, setNewDifficulty] = useState<TaskDifficulty>('Medium');
  const [newTime, setNewTime] = useState('4h');

  if (!project) return notFound();

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditDifficulty(task.difficulty);
    setEditTime(task.estimatedTime);
  };

  const handleSaveEdit = () => {
    if (!editingTask || !editTitle.trim()) return;
    updateTask(id, editingTask.id, {
      title: editTitle,
      description: editDescription,
      status: editStatus,
      priority: editPriority,
      difficulty: editDifficulty,
      estimatedTime: editTime,
    });
    setEditingTask(null);
  };

  const handleAddTask = () => {
    if (!addDialogPhase || !newTitle.trim()) return;
    addTask(id, addDialogPhase, {
      title: newTitle,
      description: newDescription,
      priority: newPriority,
      difficulty: newDifficulty,
      estimatedTime: newTime,
      status: 'Not Started',
    });
    setAddDialogPhase(null);
    setNewTitle('');
    setNewDescription('');
    setNewPriority('Medium');
    setNewDifficulty('Medium');
    setNewTime('4h');
  };

  const cycleStatus = (task: Task) => {
    const idx = STATUSES.indexOf(task.status);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    updateTaskStatus(id, task.id, next);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center gap-2">
        <ListTodo className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
      </div>

      {project.phases.map((phase, phaseIdx) => {
        const phaseTasks = project.tasks
          .filter((t) => t.phaseId === phase.id)
          .sort((a, b) => a.order - b.order);
        const progress = getPhaseProgress(project, phase.id);

        return (
          <div key={phase.id}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-xs font-bold">
                  {phaseIdx + 1}
                </div>
                <h2 className="font-semibold">{phase.title}</h2>
                <Badge variant="secondary" className="text-[10px]">
                  {progress}%
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAddDialogPhase(phase.id)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Task
              </Button>
            </div>

            <div className="space-y-2">
              {phaseTasks.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-center text-sm text-muted-foreground">
                    No tasks in this phase yet
                  </CardContent>
                </Card>
              )}
              {phaseTasks.map((task) => {
                const StatusIcon = STATUS_ICONS[task.status];
                return (
                  <Card
                    key={task.id}
                    className="group transition-all hover:border-primary/20"
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      <button
                        onClick={() => cycleStatus(task)}
                        className="mt-0.5 shrink-0"
                        title={`Click to change status (currently: ${task.status})`}
                      >
                        <StatusIcon
                          className={cn(
                            'h-5 w-5',
                            task.status === 'Completed' && 'text-chart-2',
                            task.status === 'In Progress' && 'text-chart-1',
                            task.status === 'Blocked' && 'text-destructive',
                            task.status === 'Not Started' && 'text-muted-foreground'
                          )}
                        />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              'font-medium text-sm',
                              task.status === 'Completed' && 'text-muted-foreground line-through'
                            )}
                          >
                            {task.title}
                          </p>
                        </div>
                        {task.description && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary" className={cn('text-[10px]', STATUS_COLORS[task.status])}>
                            {task.status}
                          </Badge>
                          <Badge variant="secondary" className={cn('text-[10px]', PRIORITY_COLORS[task.priority])}>
                            {task.priority}
                          </Badge>
                          <Badge variant="secondary" className={cn('text-[10px]', DIFFICULTY_COLORS[task.difficulty])}>
                            {task.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {task.estimatedTime}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openEdit(task)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => deleteTask(id, task.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as TaskStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={editPriority} onValueChange={(v) => setEditPriority(v as TaskPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={editDifficulty} onValueChange={(v) => setEditDifficulty(v as TaskDifficulty)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estimated Time</Label>
                <Input value={editTime} onChange={(e) => setEditTime(e.target.value)} placeholder="e.g. 4h" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={!!addDialogPhase} onOpenChange={(open) => !open && setAddDialogPhase(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Implement user registration"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe what needs to be done..."
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newPriority} onValueChange={(v) => setNewPriority(v as TaskPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={newDifficulty} onValueChange={(v) => setNewDifficulty(v as TaskDifficulty)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Est. Time</Label>
                <Input value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogPhase(null)}>Cancel</Button>
            <Button onClick={handleAddTask} disabled={!newTitle.trim()}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
