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

  const rawResponse = await generateAIResponse([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: contextPrompt },
  ]);

  const parsedResponse = parseAiJsonResponse(rawResponse);
  if (!parsedResponse) {
    throw new Error("AI returned invalid JSON");
  }

  const validation = techStackResponseSchema.safeParse(parsedResponse);
  if (!validation.success) {
    throw new Error(`AI response validation failed: ${validation.error.message}`);
  }

  return validation.data;
};

function cleanJsonString(str: string): string {
  str = str.replace(/```json\s*/g, "").replace(/```/g, "");
  str = str.replace(/,(\s*[}\]])/g, "$1");
  str = str.replace(/,\s*}/g, "}");
  str = str.replace(/,\s*\]/g, "]");
  str = str.replace(/([\x00-\x1F\x7F])/g, "");
  return str;
}

function parseAiJsonResponse(raw: string): unknown | null {
  if (!raw || raw.trim().length === 0) return null;

  let jsonStr = raw.trim();
  jsonStr = jsonStr.replace(/```json\s*/g, "").replace(/```/g, "");
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];
  jsonStr = cleanJsonString(jsonStr);

  try {
    return JSON.parse(jsonStr);
  } catch {}

  try {
    let recovered = jsonStr
      .replace(/[\x00-\x1F\x7F]/g, "")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*\]/g, "]")
      .replace(/'([^']*)'/g, '"$1"')
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

    for (let i = 0; i < 20; i++) {
      recovered = recovered.replace(/"([^"]*)"\s*"([^"]*)"(?=\s*[,\]}])/g, '"$1", "$2"');
    }
    recovered = recovered.replace(/,(\s*[}\]])/g, "$1");

    return JSON.parse(recovered);
  } catch {}

  try {
    let completed = jsonStr;
    let openBraces = 0, openBrackets = 0, inString = false, escapeNext = false;
    for (let i = 0; i < completed.length; i++) {
      const c = completed[i];
      if (escapeNext) { escapeNext = false; continue; }
      if (c === '\\') { escapeNext = true; continue; }
      if (c === '"' && !escapeNext) { inString = !inString; continue; }
      if (!inString) {
        if (c === '{') openBraces++;
        else if (c === '}') openBraces--;
        else if (c === '[') openBrackets++;
        else if (c === ']') openBrackets--;
      }
    }
    while (openBrackets > 0) { completed += ']'; openBrackets--; }
    while (openBraces > 0) { completed += '}'; openBraces--; }
    if (completed.match(/:\s*"[^"]*$/)) completed += '"';
    completed = cleanJsonString(completed);
    return JSON.parse(completed);
  } catch {}

  return null;
}