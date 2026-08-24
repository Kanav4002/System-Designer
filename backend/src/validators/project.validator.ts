import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(5000, "Description too long"),
  type: z.string().max(50).optional(),
  experienceLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
  description: z.string().min(1, "Description is required").max(5000, "Description too long").optional(),
  type: z.string().max(50).optional(),
  experienceLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
  status: z.enum(["Planning", "In Progress", "Completed", "On Hold"]).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});