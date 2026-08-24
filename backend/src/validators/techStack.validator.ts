import { z } from "zod";

export const techItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  reason: z.string().min(1, "Reason is required"),
  alternatives: z.array(z.string()).default([]),
});

export const techStackSchema = z.object({
  frontend: z.array(techItemSchema).default([]),
  backend: z.array(techItemSchema).default([]),
  database: z.array(techItemSchema).default([]),
  authentication: z.array(techItemSchema).default([]),
  otherServices: z.array(techItemSchema).default([]),
});

export const techStackResponseSchema = z.object({
  frontend: z.array(techItemSchema).default([]),
  backend: z.array(techItemSchema).default([]),
  database: z.array(techItemSchema).default([]),
  authentication: z.array(techItemSchema).default([]),
  otherServices: z.array(techItemSchema).default([]),
});

export type TechItem = z.infer<typeof techItemSchema>;
export type TechStack = z.infer<typeof techStackSchema>;
export type TechStackResponse = z.infer<typeof techStackResponseSchema>;