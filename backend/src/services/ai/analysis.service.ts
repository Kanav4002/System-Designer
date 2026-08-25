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

  const rawResponse = await generateAIResponse([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ]);

  const parsedResponse = parseAiJsonResponse(rawResponse);
  if (!parsedResponse) {
    throw new Error("AI returned invalid JSON");
  }

  const validation = analysisResponseSchema.safeParse(parsedResponse);
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

  // Recovery: fix common AI JSON issues
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

  // Truncated JSON completion
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