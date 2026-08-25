import { z } from "zod";

export const taskStatusSchema = z.enum(["not_started", "in_progress", "completed", "blocked"]);

export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required").max(5000, "Description too long"),
  priority: taskPrioritySchema.default("medium"),
  estimatedHours: z.number().positive("Estimated hours must be positive").max(1000, "Too many hours"),
  dependencies: z.array(z.string()).default([]),
  phase: z.number().int().positive("Phase number must be positive"),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
  description: z.string().min(1, "Description is required").max(5000, "Description too long").optional(),
  priority: taskPrioritySchema.optional(),
  estimatedHours: z.number().positive("Estimated hours must be positive").max(1000, "Too many hours").optional(),
  dependencies: z.array(z.string()).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;