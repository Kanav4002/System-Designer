import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().min(1, "Task description is required"),
  order: z.number().int().positive(),
  estimatedHours: z.number().min(0),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["not_started", "in_progress", "completed", "blocked"]).default("not_started"),
  dependencies: z.array(z.string()).default([]),
});

export const phaseSchema = z.object({
  phaseNumber: z.number().int().positive(),
  title: z.string().min(1, "Phase title is required"),
  description: z.string().min(1, "Phase description is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  order: z.number().int().positive(),
  tasks: z.array(taskSchema).default([]),
});

export const roadmapResponseSchema = z.object({
  phases: z.array(phaseSchema).min(1, "At least one phase is required"),
});

export const statisticsSchema = z.object({
  totalTasks: z.number().int().nonnegative(),
  completedTasks: z.number().int().nonnegative(),
  inProgressTasks: z.number().int().nonnegative(),
  notStartedTasks: z.number().int().nonnegative(),
  blockedTasks: z.number().int().nonnegative(),
  progress: z.number().int().min(0).max(100),
});

export type Task = z.infer<typeof taskSchema>;
export type Phase = z.infer<typeof phaseSchema>;
export type RoadmapResponse = z.infer<typeof roadmapResponseSchema>;
export type Statistics = z.infer<typeof statisticsSchema>;