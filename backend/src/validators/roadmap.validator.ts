import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().positive(),
  estimatedHours: z.number().positive(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["not_started", "in_progress", "completed", "blocked"]),
  dependencies: z.array(z.string()),
});

const phaseSchema = z.object({
  phaseNumber: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  order: z.number().int().positive(),
  tasks: z.array(taskSchema),
});

export const roadmapResponseSchema = z.object({
  phases: z.array(phaseSchema).min(1),
});

export type RoadmapResponse = z.infer<typeof roadmapResponseSchema>;
