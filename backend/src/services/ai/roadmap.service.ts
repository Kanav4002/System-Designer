import { generateAIResponse } from "./groq.service.js";
import { roadmapResponseSchema, type RoadmapResponse } from "../../validators/roadmap.validator.js";

const SYSTEM_PROMPT = `You are an expert project manager. Generate a practical development roadmap as JSON only.

Schema:
{
  "phases": [
    {
      "phaseNumber": 1,
      "title": "string",
      "description": "string",
      "difficulty": "easy | medium | hard",
      "order": 1,
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "order": 1,
          "estimatedHours": number,
          "priority": "low | medium | high",
          "status": "not_started",
          "dependencies": ["task_title_string"]
        }
      ]
    }
  ]
}

Rules:
- 3-8 phases based on complexity
- 3-6 tasks per phase
- Logical progression: planning -> development -> testing -> deployment
- Difficulty: easy/medium/hard
- Status: ALWAYS "not_started"
- Dependencies: use task titles as strings
- Priority: high/medium/low
- Hours: 2-16 per task
- Return ONLY valid JSON. No markdown, no explanations, no code blocks.`;

const MAX_DESCRIPTION_LENGTH = 500;

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

function buildContextPrompt(
  projectName: string,
  projectDescription: string,
  projectType: string,
  experienceLevel: string,
  analysis?: any,
  techStack?: any
): string {
  const projectSeed = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  let prompt = `Project: ${projectName}
Description: ${truncate(projectDescription, 500)}
Type: ${projectType}
Level: ${experienceLevel}`;

  if (analysis) {
    prompt += `
Analysis: ${truncate(analysis.summary, 300)}
Features: ${analysis.mainFeatures?.slice(0, 5).join(", ") || "N/A"}
Complexity: ${analysis.technicalComplexity?.level || "Medium"}
Estimated Phases: ${analysis.estimatedPhases || "Auto"}`;
  }

  if (techStack) {
    const tech = [
      ...(techStack.frontend || []).slice(0, 3).map((t: any) => t.name),
      ...(techStack.backend || []).slice(0, 3).map((t: any) => t.name),
      ...(techStack.database || []).slice(0, 2).map((t: any) => t.name),
      ...(techStack.authentication || []).slice(0, 1).map((t: any) => t.name),
      ...(techStack.otherServices || []).slice(0, 1).map((t: any) => t.name),
    ];
    prompt += `
Tech: ${tech.join(", ")}`;
  }

  prompt += `

IMPORTANT: Generate a UNIQUE roadmap tailored specifically to "${projectName}". 
Consider the project's specific: ${projectType}, "${projectDescription.substring(0, 100)}...", 
tech stack: ${techStack ? "provided" : "not specified"}, and complexity level.
Focus on the UNIQUE aspects of this project. Do NOT use generic templates.
Do NOT truncate the output. Complete ALL phases and ALL tasks in full.`;

  prompt += `\n\nGenerate roadmap JSON now. Output ONLY the JSON object with ${analysis?.estimatedPhases || "appropriate number of"} phases:`;
  return prompt;
}

function generateFallbackRoadmap(
  projectName: string,
  projectDescription: string,
  projectType: string,
  experienceLevel: string,
  estimatedPhases?: number
): RoadmapResponse {
  const projectSeed = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const isComplex = projectDescription.length > 200 || experienceLevel !== "Beginner";
  const numPhases = estimatedPhases || (isComplex ? 5 : 4);
  
  const variations = [
    ["Planning & Setup", "Project Initiation & Planning", "Foundation & Planning"],
    ["Design & Architecture", "Architecture & Design", "Technical Design & Architecture"],
    ["Core Development", "Core Development & Implementation", "Development & Implementation"],
    ["Testing & Deployment", "Testing, QA & Deployment", "Quality Assurance & Release"],
    ["Advanced Features & Scaling", "Advanced Features & Optimization", "Enhancement & Scaling"]
  ];
  
  const pickVariation = (index: number) => variations[index][projectSeed % variations[index].length];
  
  const phases = [
    {
      phaseNumber: 1,
      title: pickVariation(0),
      description: `Define project scope, set up development environment, and choose tech stack for ${projectName}.`,
      difficulty: "easy" as const,
      order: 1,
      tasks: [
        { title: "Define project scope", description: `Outline project boundaries, goals, and deliverables for ${projectName}.`, order: 1, estimatedHours: 4, priority: "high" as const, status: "not_started" as const, dependencies: [] },
        { title: "Set up development environment", description: "Install tools, configure IDE, and initialize version control.", order: 2, estimatedHours: 3, priority: "high" as const, status: "not_started" as const, dependencies: ["Define project scope"] },
        { title: "Choose tech stack", description: `Select frameworks, libraries, and tools for ${projectName}.`, order: 3, estimatedHours: 3, priority: "high" as const, status: "not_started" as const, dependencies: ["Define project scope"] },
        { title: "Create project timeline", description: "Draft schedule with milestones for each phase.", order: 4, estimatedHours: 2, priority: "medium" as const, status: "not_started" as const, dependencies: ["Choose tech stack"] },
      ]
    },
    {
      phaseNumber: 2,
      title: pickVariation(1),
      description: `Create UI/UX designs, define data models, and plan system architecture for ${projectName}.`,
      difficulty: "medium" as const,
      order: 2,
      tasks: [
        { title: "Create wireframes", description: `Sketch low-fidelity layouts for key screens of ${projectName}.`, order: 1, estimatedHours: 5, priority: "high" as const, status: "not_started" as const, dependencies: ["Create project timeline"] },
        { title: "Design UI mockups", description: "Develop high-fidelity visual designs based on wireframes.", order: 2, estimatedHours: 6, priority: "high" as const, status: "not_started" as const, dependencies: ["Create wireframes"] },
        { title: "Define data model", description: `Design database schema and API data contracts for ${projectName}.`, order: 3, estimatedHours: 4, priority: "medium" as const, status: "not_started" as const, dependencies: ["Gather requirements"] },
        { title: "Plan API structure", description: "Define REST endpoints and data flow.", order: 4, estimatedHours: 4, priority: "medium" as const, status: "not_started" as const, dependencies: ["Define data model"] },
      ]
    },
    {
      phaseNumber: 3,
      title: pickVariation(2),
      description: `Build main application features, authentication, and core functionality for ${projectName}.`,
      difficulty: "medium" as const,
      order: 3,
      tasks: [
        { title: "Set up project structure", description: "Initialize repository with folder structure for frontend/backend.", order: 1, estimatedHours: 3, priority: "high" as const, status: "not_started" as const, dependencies: ["Plan API structure"] },
        { title: "Implement authentication", description: "Add user registration, login, and session management.", order: 2, estimatedHours: 8, priority: "high" as const, status: "not_started" as const, dependencies: ["Set up project structure"] },
        { title: "Build core features", description: `Develop main application pages and business logic for ${projectName}.`, order: 3, estimatedHours: 12, priority: "high" as const, status: "not_started" as const, dependencies: ["Implement authentication"] },
        { title: "Integrate with APIs", description: "Connect frontend to backend services and third-party APIs.", order: 4, estimatedHours: 8, priority: "medium" as const, status: "not_started" as const, dependencies: ["Build core features"] },
      ]
    },
    {
      phaseNumber: 4,
      title: pickVariation(3),
      description: `Validate functionality, fix issues, and deploy ${projectName} to production.`,
      difficulty: "hard" as const,
      order: 4,
      tasks: [
        { title: "Write unit tests", description: "Create automated tests for critical functions.", order: 1, estimatedHours: 6, priority: "high" as const, status: "not_started" as const, dependencies: ["Build core features"] },
        { title: "Perform integration testing", description: "Test end-to-end user flows and API integrations.", order: 2, estimatedHours: 5, priority: "medium" as const, status: "not_started" as const, dependencies: ["Write unit tests"] },
        { title: "Fix bugs and polish UI", description: "Resolve defects and improve user interface.", order: 3, estimatedHours: 8, priority: "high" as const, status: "not_started" as const, dependencies: ["Perform integration testing"] },
        { title: "Deploy to production", description: `Configure hosting, CI/CD, and launch ${projectName}.`, order: 4, estimatedHours: 4, priority: "high" as const, status: "not_started" as const, dependencies: ["Fix bugs and polish UI"] },
      ]
    },
  ];

  if (numPhases >= 5) {
    phases.push({
      phaseNumber: 5,
      title: pickVariation(4),
      description: `Implement advanced features, performance optimization, and scaling preparation for ${projectName}.`,
      difficulty: "hard" as const,
      order: 5,
      tasks: [
        { title: "Implement advanced features", description: `Add complex features like real-time updates, notifications, etc. for ${projectName}.`, order: 1, estimatedHours: 10, priority: "high" as const, status: "not_started" as const, dependencies: ["Build core features"] },
        { title: "Performance optimization", description: "Optimize database queries, caching, and load times.", order: 2, estimatedHours: 6, priority: "medium" as const, status: "not_started" as const, dependencies: ["Integrate with APIs"] },
        { title: "Security hardening", description: "Implement rate limiting, input validation, and security headers.", order: 3, estimatedHours: 5, priority: "high" as const, status: "not_started" as const, dependencies: ["Third-party integrations"] },
        { title: "Monitoring & observability", description: "Set up logging, metrics, and alerting for production.", order: 4, estimatedHours: 4, priority: "medium" as const, status: "not_started" as const, dependencies: ["Deploy to production"] },
      ]
    });
  }

  return { phases };
}

class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number;

  constructor(capacity = 10, refillRate = 0.5) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    while (true) {
      this.refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      const waitMs = Math.ceil((1 - this.tokens) / this.refillRate * 1000);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillRate);
    this.lastRefill = now;
  }
}

const groqRateLimiter = new RateLimiter(5, 0.3);

async function generateWithRetry(prompt: string, maxRetries = 5): Promise<string> {
  await groqRateLimiter.acquire();
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateAIResponse([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ]);
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.error?.code === "rate_limit_exceeded";
      
      if (isRateLimit && attempt < maxRetries) {
        const retryAfter = error?.headers?.["retry-after"] || 
                          error?.error?.message?.match(/try again in (\d+)/)?.[1] || "30";
        const baseWait = Math.min(parseInt(retryAfter) * 1000, 60000);
        const backoffMs = Math.min(
          baseWait * Math.pow(2, attempt) + Math.random() * 5000,
          120000
        );
        console.warn(`Rate limited (attempt ${attempt + 1}/${maxRetries + 1}), waiting ${Math.round(backoffMs/1000)}s`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

function cleanJsonString(str: string): string {
  str = str.replace(/```json\s*/g, "").replace(/```/g, "");
  str = str.replace(/,(\s*[}\]])/g, "$1");
  str = str.replace(/,\s*}/g, "}");
  str = str.replace(/,\s*\]/g, "]");
  str = str.replace(/([\x00-\x1F\x7F])/g, "");
  return str;
}

function tryParseJson(rawResponse: string): string | null {
  let jsonStr = rawResponse.trim();
  jsonStr = jsonStr.replace(/```json\s*/g, "").replace(/```/g, "");
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];
  jsonStr = cleanJsonString(jsonStr);
  try {
    JSON.parse(jsonStr);
    return jsonStr;
  } catch {
    return null;
  }
}

function tryRecoverJson(rawResponse: string): string | null {
  let jsonStr = rawResponse.trim();
  jsonStr = jsonStr.replace(/```json\s*/g, "").replace(/```/g, "");
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  let recovered = jsonMatch[0];

  recovered = recovered
    .replace(/```json\s*/g, "").replace(/```/g, "")
    .replace(/```/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/,\s*}/g, "}")
    .replace(/,\s*\]/g, "]")
    .replace(/,(\s*[}\]])/g, "$1")
    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
    .replace(/'([^']*)'/g, '"$1"')
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/"\s+"(?=\s*[\]\}])/g, '", "')
    .replace(/"\s+"(?=\s*[,\]])/g, '", "')
    .replace(/"\s*"(?=\s*:)/g, '"')
    .replace(/"\s*\n\s*"/g, '",\n"')
    .replace(/"\s*\r\s*"/g, '",\r"')
    .replace(/"([^"]*)"\s*"([^"]*)"(?=\s*[,\]])/g, '"$1", "$2"');

  for (let i = 0; i < 20; i++) {
    recovered = recovered.replace(/"([^"]*)"\s*"([^"]*)"(?=\s*[,\]}])/g, '"$1", "$2"');
  }

  recovered = recovered
    .replace(/"([^"]*)"\s*"([^"]*)"\s*"([^"]*)"(?=\s*[,\]}])/g, '"$1", "$2", "$3"')
    .replace(/"([^"]*)"\s*"([^"]*)"\s*"([^"]*)"\s*"([^"]*)"(?=\s*[,\]}])/g, '"$1", "$2", "$3", "$4"')
    .replace(/"([^"]*)"\s*"([^"]*)"\s*"([^"]*)"\s*"([^"]*)"\s*"([^"]*)"(?=\s*[,\]}])/g, '"$1", "$2", "$3", "$4", "$5"')
    .replace(/"\s*"(?=\s*:)/g, '"')
    .replace(/,(\s*[}\]])/g, "$1")
    .replace(/,\s*}/g, "}")
    .replace(/,\s*\]/g, "]");

  try {
    JSON.parse(recovered);
    return recovered;
  } catch {
    return null;
  }
}

function tryCompleteTruncatedJson(rawResponse: string): RoadmapResponse | null {
  try {
    let jsonStr = rawResponse.trim();
    jsonStr = jsonStr.replace(/```json\s*/g, "").replace(/```/g, "");
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    jsonStr = jsonMatch[0];
    jsonStr = cleanJsonString(jsonStr);

    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i];
      if (escapeNext) { escapeNext = false; continue; }
      if (char === '\\') { escapeNext = true; continue; }
      if (char === '"' && !escapeNext) { inString = !inString; continue; }
      if (!inString) {
        if (char === '{') openBraces++;
        else if (char === '}') openBraces--;
        else if (char === '[') openBrackets++;
        else if (char === ']') openBrackets--;
      }
    }

    while (openBrackets > 0) { jsonStr += ']'; openBrackets--; }
    while (openBraces > 0) { jsonStr += '}'; openBraces--; }

    if (jsonStr.match(/:\s*"[^"]*$/)) jsonStr += '"';

    jsonStr = cleanJsonString(jsonStr);

    const parsed = JSON.parse(jsonStr);
    if (parsed.phases && Array.isArray(parsed.phases) && parsed.phases.length > 0) {
      return parsed as RoadmapResponse;
    }
    return null;
  } catch {
    return null;
  }
}

function tryExtractPhasesArray(rawResponse: string): RoadmapResponse | null {
  try {
    const phasesMatch = rawResponse.match(/"phases"\s*:\s*\[([\s\S]*?)\]/);
    if (!phasesMatch) return null;
    const phasesStr = "{\"phases\":[" + phasesMatch[1] + "]}";
    const cleaned = cleanJsonString(phasesStr);
    const parsed = JSON.parse(cleaned);
    if (parsed.phases && parsed.phases.length > 0) {
      return parsed as RoadmapResponse;
    }
    return null;
  } catch {
    return null;
  }
}

export const generateRoadmap = async (
  projectName: string,
  projectDescription: string,
  projectType: string,
  experienceLevel: string,
  analysis?: {
    summary: string;
    mainFeatures: string[];
    technicalComplexity: { level: string; reason: string };
    estimatedPhases: number;
  },
  techStack?: {
    frontend: Array<{ name: string; description: string }>;
    backend: Array<{ name: string; description: string }>;
    database: Array<{ name: string; description: string }>;
    authentication: Array<{ name: string; description: string }>;
    otherServices: Array<{ name: string; description: string }>;
  }
): Promise<RoadmapResponse> => {
  const contextPrompt = buildContextPrompt(
    projectName,
    projectDescription,
    projectType,
    experienceLevel,
    analysis,
    techStack
  );

  let rawResponse: string;
  
  try {
    rawResponse = await generateWithRetry(contextPrompt);
  } catch (aiError) {
    console.warn("AI generation failed, using fallback roadmap:", aiError);
    return generateFallbackRoadmap(projectName, projectDescription, projectType, experienceLevel, analysis?.estimatedPhases);
  }

  console.log("Raw AI response (first 500 chars):", rawResponse.substring(0, 500));
  console.log("Raw AI response (last 500 chars):", rawResponse.slice(-500));

  if (!rawResponse || rawResponse.trim().length === 0) {
    console.warn("Empty AI response, using fallback roadmap");
    return generateFallbackRoadmap(projectName, projectDescription, projectType, experienceLevel, analysis?.estimatedPhases);
  }

  let jsonStr: string | null = null;

  jsonStr = tryParseJson(rawResponse);
  if (jsonStr) {
    console.log("Parsed AI response directly");
    return JSON.parse(jsonStr) as RoadmapResponse;
  }
  console.warn("Direct parse failed, attempting recovery...");

  jsonStr = tryRecoverJson(rawResponse);
  if (jsonStr) {
    console.log("Recovered AI response");
    return JSON.parse(jsonStr) as RoadmapResponse;
  }
  console.warn("Recovery failed, attempting truncated JSON completion...");

  let result: RoadmapResponse | null;

  result = tryCompleteTruncatedJson(rawResponse);
  if (result) {
    console.log("Completed truncated JSON");
    return result;
  }
  console.warn("Truncated completion failed, attempting phases array extraction...");

  result = tryExtractPhasesArray(rawResponse);
  if (result) {
    console.log("Extracted phases array as fallback");
    return result;
  }

  console.warn("All parsing attempts failed, using fallback roadmap");
  return generateFallbackRoadmap(projectName, projectDescription, projectType, experienceLevel, analysis?.estimatedPhases);
};
