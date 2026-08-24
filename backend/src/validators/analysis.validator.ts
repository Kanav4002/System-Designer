import { z } from "zod";

export const technicalComplexitySchema = z.object({
  level: z.enum(["Low", "Medium", "High", "Very High"]),
  reason: z.string().min(1, "Reason is required"),
});

export const generateAnalysisSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  technicalComplexity: technicalComplexitySchema,
  estimatedPhases: z.number().int().min(1).max(20),
  mainFeatures: z.array(z.string()).default([]),
  targetUsers: z.array(z.string()).default([]),
  functionalRequirements: z.array(z.string()).default([]),
  nonFunctionalRequirements: z.array(z.string()).default([]),
});

export const analysisResponseSchema = z.object({
  summary: z.string().min(1),
  technicalComplexity: technicalComplexitySchema,
  estimatedPhases: z.number().int().min(1).max(20),
  mainFeatures: z.array(z.string()).default([]),
  targetUsers: z.array(z.string()).default([]),
  functionalRequirements: z.array(z.string()).default([]),
  nonFunctionalRequirements: z.array(z.string()).default([]),
});

export type TechnicalComplexity = z.infer<typeof technicalComplexitySchema>;
export type GenerateAnalysisInput = z.infer<typeof generateAnalysisSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;