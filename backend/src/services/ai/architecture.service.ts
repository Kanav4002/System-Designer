import { generateAIResponse } from "./index.js";
import {
  architectureResponseSchema,
  type ArchitectureResponse,
} from "../../validators/architecture.validator.js";

const SYSTEM_PROMPT = `You are an expert software architect. Generate a logical system architecture for the given project based on its description, type, experience level, AI analysis, and tech stack.

Return ONLY valid JSON matching this exact schema:
{
  "nodes": [
    {
      "id": "string - unique identifier",
      "type": "string - e.g., service, database, external",
      "label": "string - display name",
      "description": "string - what this component does",
      "technology": "string - specific technology/framework",
      "category": "string - frontend, backend, database, authentication, ai, external_service, cache, storage, queue, api, service, other",
      "position": {
        "x": number,
        "y": number
      }
    }
  ],
  "edges": [
    {
      "id": "string - unique identifier",
      "source": "string - source node ID",
      "target": "string - target node ID",
      "label": "string - connection type (e.g., REST API, GraphQL, gRPC, Message Queue)",
      "type": "string - default, animated, step, smoothstep"
    }
  ]
}

Rules:
- Generate nodes and edges that make sense for the SPECIFIC project
- Different projects MUST produce different architectures
- Do NOT use fixed templates - analyze the project and create appropriate components
- Simple projects: 3-5 nodes (e.g., Frontend -> Backend -> Database)
- Medium projects: 6-10 nodes (e.g., Frontend -> API -> Auth -> Database + Payment)
- Complex projects: 11+ nodes (e.g., multiple services, AI components, vector DBs, message queues)
- Position nodes in a logical left-to-right flow (frontend on left, database on right)
- x coordinates: 100-1000, y coordinates: 100-600
- Every edge MUST reference valid node IDs from the nodes array
- Edges should represent real communication/dependency relationships
- Return ONLY the JSON object. No markdown, no explanations, no code blocks.`;

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

function buildContextPrompt(
  projectName: string,
  projectDescription: string,
  projectType: string,
  experienceLevel: string,
  analysis?: any,
  techStack?: any,
  roadmap?: any
): string {
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
Tech Stack: ${tech.join(", ")}`;
  }

  if (roadmap) {
    const totalPhases = roadmap.phases?.length || 0;
    const totalTasks = roadmap.phases?.reduce((sum: number, p: any) => sum + (p.tasks?.length || 0), 0) || 0;
    prompt += `
Roadmap: ${totalPhases} phases, ${totalTasks} tasks`;
  }

  prompt += `

IMPORTANT: Generate a UNIQUE architecture tailored specifically to "${projectName}". 
Consider the project's specific: ${projectType}, "${projectDescription.substring(0, 100)}...", 
tech stack: ${techStack ? "provided" : "not specified"}, and complexity level.
Focus on the UNIQUE aspects of this project. Do NOT use generic templates.
The architecture should reflect the actual technology choices and project requirements.`;

  prompt += `\n\nGenerate architecture JSON now. Output ONLY the JSON object with nodes and edges:`;
  return prompt;
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
      console.log(`Attempting AI generation (attempt ${attempt + 1}/${maxRetries + 1})...`);
      const result = await Promise.race([
        generateAIResponse([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ]),
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error("AI request timeout after 60s")), 60000)
        )
      ]);
      console.log("AI generation successful");
      return result;
    } catch (error: any) {
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
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

function extractJsonFromResponse(rawResponse: string): string | null {
  let jsonStr = rawResponse.trim();
  
  // Remove markdown code blocks
  jsonStr = jsonStr.replace(/```json\s*/g, "").replace(/```/g, "");
  
  // Try to find the first complete JSON object
  let openBraces = 0;
  let startIdx = -1;
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') {
        if (openBraces === 0 && startIdx === -1) {
          startIdx = i;
        }
        openBraces++;
      } else if (char === '}') {
        openBraces--;
        if (openBraces === 0 && startIdx !== -1) {
          const candidate = jsonStr.substring(startIdx, i + 1);
          try {
            JSON.parse(candidate);
            return candidate;
          } catch {
            // Continue searching for valid JSON
            startIdx = -1;
          }
        }
      }
    }
  }
  
  // Fallback: try to find any {...} pattern
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const candidate = jsonMatch[0];
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      return null;
    }
  }
  
  return null;
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

function validateArchitectureStructure(parsed: any): boolean {
  if (!parsed.nodes || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
    console.warn("Validation failed: no nodes or empty array");
    return false;
  }
  if (!parsed.edges || !Array.isArray(parsed.edges)) {
    console.warn("Validation failed: no edges or not array");
    return false;
  }
  
  for (const node of parsed.nodes) {
    if (!node.id || typeof node.id !== "string" || node.id.trim() === "") {
      console.warn("Validation failed: node missing valid id");
      return false;
    }
    if (!node.type || typeof node.type !== "string" || node.type.trim() === "") {
      console.warn(`Validation failed: node ${node.id} missing valid type`);
      return false;
    }
    if (!node.label || typeof node.label !== "string" || node.label.trim() === "") {
      console.warn(`Validation failed: node ${node.id} missing valid label`);
      return false;
    }
    if (typeof node.description !== "string") {
      console.warn(`Validation failed: node ${node.id} missing description string`);
      return false;
    }
    if (typeof node.technology !== "string") {
      console.warn(`Validation failed: node ${node.id} missing technology string`);
      return false;
    }
    if (!node.category || typeof node.category !== "string" || node.category.trim() === "") {
      console.warn(`Validation failed: node ${node.id} missing valid category`);
      return false;
    }
    if (!node.position || typeof node.position.x !== "number" || typeof node.position.y !== "number") {
      console.warn(`Validation failed: node ${node.id} missing valid position coordinates`);
      return false;
    }
  }

  const nodeIds = new Set(parsed.nodes.map((n: any) => n.id));
  console.log("Node IDs:", Array.from(nodeIds));
  if (nodeIds.size !== parsed.nodes.length) {
    console.warn("Validation failed: duplicate node IDs");
    return false;
  }
  
  for (const edge of parsed.edges) {
    if (!edge.id || typeof edge.id !== "string" || edge.id.trim() === "") {
      console.warn("Validation failed: edge missing valid id");
      return false;
    }
    if (!edge.source || typeof edge.source !== "string" || !nodeIds.has(edge.source)) {
      console.warn(`Validation failed: edge ${edge.id} references non-existent source node: ${edge.source}`);
      return false;
    }
    if (!edge.target || typeof edge.target !== "string" || !nodeIds.has(edge.target)) {
      console.warn(`Validation failed: edge ${edge.id} references non-existent target node: ${edge.target}`);
      return false;
    }
    if (typeof edge.label !== "string") {
      console.warn(`Validation failed: edge ${edge.id} missing label string`);
      return false;
    }
    if (typeof edge.type !== "string") {
      console.warn(`Validation failed: edge ${edge.id} missing type string`);
      return false;
    }
  }
  
  return true;
}
function generateFallbackArchitecture(
  projectName: string,
  projectDescription: string,
  projectType: string,
  experienceLevel: string,
  techStack?: any
): ArchitectureResponse {
  console.log("Generating fallback architecture");
  
  const isMobile = projectType.toLowerCase().includes("mobile");
  const isSaaS = projectType.toLowerCase().includes("saas");
  const isEcommerce = projectDescription.toLowerCase().includes("ecommerce") || projectDescription.toLowerCase().includes("e-commerce");
  const hasAI = projectDescription.toLowerCase().includes("ai") || projectDescription.toLowerCase().includes("machine learning");
  
  // Determine complexity
  let complexity = "simple";
  if (hasAI || isSaaS || isEcommerce) complexity = "complex";
  else if (projectDescription.length > 200 || experienceLevel !== "Beginner") complexity = "medium";
  
  const nodes: any[] = [];
  const edges: any[] = [];
  let edgeId = 0;
  
  const addNode = (id: string, type: string, label: string, description: string, technology: string, category: string, x: number, y: number) => {
    nodes.push({ id, type, label, description, technology, category, position: { x, y } });
  };
  
  const addEdge = (source: string, target: string, label: string, type = "default") => {
    edges.push({ id: `edge${edgeId++}`, source, target, label, type });
  };
  
  // Frontend
  const frontendTech = techStack?.frontend?.[0]?.name || (isMobile ? "React Native" : "React + Vite");
  addNode("frontend", "frontend", "Frontend", "User interface for the application", frontendTech, "frontend", 100, 200);
  
  // API Gateway / Backend
  const backendTech = techStack?.backend?.[0]?.name || "Node.js / Express";
  addNode("gateway", "service", "API Gateway", "Routes requests to appropriate services", "Nginx / API Gateway", "api", 300, 200);
  addEdge("frontend", "gateway", "HTTPS / REST");
  
  addNode("backend", "service", "Backend Service", "Core business logic and API endpoints", backendTech, "backend", 500, 200);
  addEdge("gateway", "backend", "Internal API");
  
  // Database
  const dbTech = techStack?.database?.[0]?.name || "PostgreSQL";
  addNode("database", "database", "Primary Database", "Persistent data storage", dbTech, "database", 700, 200);
  addEdge("backend", "database", "SQL / ORM");
  
  // Cache
  const cacheTech = techStack?.otherServices?.find((s: any) => s.name.toLowerCase().includes("redis"))?.name || "Redis";
  addNode("cache", "cache", "Cache Layer", "Caching and session storage", cacheTech, "cache", 700, 400);
  addEdge("backend", "cache", "Cache");
  
  if (hasAI) {
    const aiTech = techStack?.otherServices?.find((s: any) => s.name.toLowerCase().includes("ai") || s.name.toLowerCase().includes("openai"))?.name || "OpenAI API";
    addNode("ai", "ai", "AI Service", "Machine learning and AI processing", aiTech, "ai", 500, 500);
    addEdge("backend", "ai", "API");
  }
  
  if (isSaaS || isEcommerce) {
    const authTech = techStack?.authentication?.[0]?.name || "JWT / OAuth";
    addNode("auth", "auth", "Auth Service", "Authentication and authorization", authTech, "authentication", 300, 500);
    addEdge("gateway", "auth", "Auth");
    
    if (isEcommerce) {
      const paymentTech = techStack?.otherServices?.find((s: any) => s.name.toLowerCase().includes("stripe") || s.name.toLowerCase().includes("payment"))?.name || "Stripe";
      addNode("payment", "payment", "Payment Service", "Payment processing", paymentTech, "external_service", 500, 400);
      addEdge("backend", "payment", "API");
    }
  }
  
  if (complexity === "complex") {
    const queueTech = techStack?.otherServices?.find((s: any) => s.name.toLowerCase().includes("rabbit") || s.name.toLowerCase().includes("queue"))?.name || "RabbitMQ";
    addNode("queue", "queue", "Message Queue", "Async task processing", queueTech, "queue", 500, 600);
    addEdge("backend", "queue", "Async");
  }
  
  const nodesCount = nodes.length;
  const edgesCount = edges.length;
  
  console.log(`Generated fallback architecture with ${nodesCount} nodes and ${edgesCount} edges`);
  
  return { nodes, edges };
}

export const generateArchitecture = async (
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
  },
  roadmap?: {
    phases: Array<{
      phaseNumber: number;
      title: string;
      tasks: Array<any>;
    }>;
  }
): Promise<ArchitectureResponse> => {
  const contextPrompt = buildContextPrompt(
    projectName,
    projectDescription,
    projectType,
    experienceLevel,
    analysis,
    techStack,
    roadmap
  );

  let rawResponse: string;
  
  try {
    rawResponse = await generateWithRetry(contextPrompt);
  } catch (aiError) {
    console.error("AI generation failed:", aiError);
    throw new Error("Failed to generate architecture: AI service unavailable");
  }

  console.log("Raw AI architecture response (first 500 chars):", rawResponse.substring(0, 500));
  console.log("Raw AI architecture response (last 500 chars):", rawResponse.slice(-500));

  if (!rawResponse || rawResponse.trim().length === 0) {
    console.warn("Empty AI response");
    throw new Error("AI service returned empty response");
  }

  let parsed: any;
  let jsonStr: string | null = null;

  // Try to extract JSON from the response
  jsonStr = extractJsonFromResponse(rawResponse);
  if (jsonStr) {
    console.log("Parsed AI response directly");
    parsed = JSON.parse(jsonStr);
    if (validateArchitectureStructure(parsed)) {
      return parsed as ArchitectureResponse;
    }
    console.warn("Direct parse passed but structure validation failed");
  }
  console.warn("Direct parse failed, attempting recovery...");

  jsonStr = tryRecoverJson(rawResponse);
  if (jsonStr) {
    console.log("Recovered AI response");
    parsed = JSON.parse(jsonStr);
    if (validateArchitectureStructure(parsed)) {
      return parsed as ArchitectureResponse;
    }
    console.warn("Recovery passed but structure validation failed");
  }
  console.warn("Recovery failed, attempting fallback architecture...");

  // Fallback: generate a basic architecture based on project type and tech stack
  return generateFallbackArchitecture(projectName, projectDescription, projectType, experienceLevel, techStack);
}
