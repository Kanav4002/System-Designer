import { generateAIResponse } from "./groq.service.js";
import { techStackResponseSchema, type TechStackResponse } from "../../validators/techStack.validator.js";

const SYSTEM_PROMPT = `You are an expert software architect. Recommend a technology stack for the given project based on its description, type, experience level, and AI analysis (if available).

Return ONLY valid JSON matching this exact schema:
{
  "frontend": [
    {
      "name": "string",
      "description": "string",
      "reason": "string",
      "alternatives": ["string"]
    }
  ],
  "backend": [
    {
      "name": "string",
      "description": "string",
      "reason": "string",
      "alternatives": ["string"]
    }
  ],
  "database": [
    {
      "name": "string",
      "description": "string",
      "reason": "string",
      "alternatives": ["string"]
    }
  ],
  "authentication": [
    {
      "name": "string",
      "description": "string",
      "reason": "string",
      "alternatives": ["string"]
    }
  ],
  "otherServices": [
    {
      "name": "string",
      "description": "string",
      "reason": "string",
      "alternatives": ["string"]
    }
  ]
}

Guidelines:
- frontend: 1-3 items (framework, UI library, state management)
- backend: 1-3 items (framework, API layer, validation)
- database: 1-2 items (primary DB, cache if needed)
- authentication: 1-2 items (auth provider, session management)
- otherServices: 0-4 items (message queue, storage, monitoring, CI/CD, etc.)
- Choose technologies appropriate for the project type and experience level
- Provide clear reasoning for each choice
- List 2-3 alternatives for each technology
- Return ONLY the JSON object. No markdown, no explanations.`;

export const generateTechStack = async (
  projectName: string,
  projectDescription: string,
  projectType: string,
  experienceLevel: string,
  analysis?: {
    summary: string;
    mainFeatures: string[];
    technicalComplexity: { level: string; reason: string };
    estimatedPhases: number;
  }
): Promise<TechStackResponse> => {
  let contextPrompt = `Project Name: ${projectName}
Description: ${projectDescription}
Type: ${projectType}
Experience Level: ${experienceLevel}`;

  if (analysis) {
    contextPrompt += `

AI Analysis Summary: ${analysis.summary}
Main Features: ${analysis.mainFeatures.join(", ")}
Technical Complexity: ${analysis.technicalComplexity.level} - ${analysis.technicalComplexity.reason}
Estimated Phases: ${analysis.estimatedPhases}`;
  }

  contextPrompt += `\n\nProvide a complete technology stack recommendation as JSON.`;

  const rawResponse = await generateAIResponse(SYSTEM_PROMPT, contextPrompt);

  let parsedResponse: unknown;
  try {
    parsedResponse = JSON.parse(rawResponse);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const validation = techStackResponseSchema.safeParse(parsedResponse);
  if (!validation.success) {
    throw new Error(`AI response validation failed: ${validation.error.message}`);
  }

  return validation.data;
};