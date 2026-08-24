import { generateAIResponse } from "./groq.service.js";
import {
  analysisResponseSchema,
  type AnalysisResponse,
} from "../../validators/analysis.validator.js";

const SYSTEM_PROMPT = `You are an expert software architect and project analyst. Analyze the given project information and provide a structured analysis in JSON format only.

Your response MUST be valid JSON matching this exact schema:
{
  "summary": "string - concise project overview",
  "technicalComplexity": {
    "level": "Low | Medium | High | Very High",
    "reason": "string - explanation of complexity"
  },
  "estimatedPhases": "integer (1-20)",
  "mainFeatures": ["string"],
  "targetUsers": ["string"],
  "functionalRequirements": ["string"],
  "nonFunctionalRequirements": ["string"]
}

Guidelines:
- summary: 2-3 sentences describing the project
- technicalComplexity.level: assess based on scope, integrations, scale, tech novelty
- estimatedPhases: realistic number of development phases (typically 3-8)
- mainFeatures: 4-8 core features
- targetUsers: 2-5 user types/personas
- functionalRequirements: 5-10 specific features/capabilities
- nonFunctionalRequirements: 3-6 quality attributes (performance, security, scalability, etc.)

Return ONLY the JSON object. No markdown, no explanations.`;

export const generateProjectAnalysis = async (
  projectName: string,
  projectDescription: string,
  projectType: string,
  experienceLevel: string
): Promise<AnalysisResponse> => {
  const userPrompt = `Project Name: ${projectName}
Description: ${projectDescription}
Type: ${projectType}
Experience Level: ${experienceLevel}

Provide a complete project analysis as JSON.`;

  const rawResponse = await generateAIResponse(SYSTEM_PROMPT, userPrompt);

  let parsedResponse: unknown;
  try {
    parsedResponse = JSON.parse(rawResponse);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const validation = analysisResponseSchema.safeParse(parsedResponse);
  if (!validation.success) {
    throw new Error(`AI response validation failed: ${validation.error.message}`);
  }

  return validation.data;
};