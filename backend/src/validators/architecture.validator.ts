import { z } from "zod";

export const nodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const architectureNodeSchema = z.object({
  id: z.string().min(1, "Node ID is required"),
  type: z.string().min(1, "Node type is required"),
  label: z.string().min(1, "Node label is required"),
  description: z.string().min(1, "Node description is required"),
  technology: z.string().min(1, "Node technology is required"),
  category: z.string().min(1, "Node category is required"),
  position: nodePositionSchema,
});

export const architectureEdgeSchema = z.object({
  id: z.string().min(1, "Edge ID is required"),
  source: z.string().min(1, "Edge source is required"),
  target: z.string().min(1, "Edge target is required"),
  label: z.string().min(1, "Edge label is required"),
  type: z.string().min(1, "Edge type is required"),
});

export const architectureResponseSchema = z.object({
  nodes: z.array(architectureNodeSchema).min(1, "At least one node is required"),
  edges: z.array(architectureEdgeSchema),
});

export type NodePosition = z.infer<typeof nodePositionSchema>;
export type ArchitectureNode = z.infer<typeof architectureNodeSchema>;
export type ArchitectureEdge = z.infer<typeof architectureEdgeSchema>;
export type ArchitectureResponse = z.infer<typeof architectureResponseSchema>;