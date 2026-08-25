import { generateAIResponse } from "./groq.service.js";
import { Analysis } from "../../models/Analysis.js";
import { TechStack } from "../../models/TechStack.js";
import { Roadmap } from "../../models/Roadmap.js";
import { Architecture } from "../../models/Architecture.js";
import { Chat } from "../../models/Chat.js";

interface ProjectContext {
  project: {
    name: string;
    description: string;
    type: string;
    experienceLevel: string;
    progress: number;
  };
  analysis?: {
    summary: string;
    technicalComplexity: { level: string; reason: string };
    mainFeatures: string[];
    targetUsers: string[];
    functionalRequirements: string[];
    nonFunctionalRequirements: string[];
  };
  techStack?: {
    frontend: Array<{ name: string; description: string; reason: string; alternatives: string[] }>;
    backend: Array<{ name: string; description: string; reason: string; alternatives: string[] }>;
    database: Array<{ name: string; description: string; reason: string; alternatives: string[] }>;
    authentication: Array<{ name: string; description: string; reason: string; alternatives: string[] }>;
    otherServices: Array<{ name: string; description: string; reason: string; alternatives: string[] }>;
  };
  roadmap?: {
    phases: Array<{
      phaseNumber: number;
      title: string;
      description: string;
      difficulty: string;
      tasks: Array<{
        title: string;
        description: string;
        status: string;
        priority: string;
        estimatedHours: number;
        dependencies: string[];
      }>;
    }>;
    statistics: {
      totalTasks: number;
      completedTasks: number;
      inProgressTasks: number;
      notStartedTasks: number;
      blockedTasks: number;
      progress: number;
    };
  };
  architecture?: {
    nodes: Array<{ id: string; label: string; description: string; technology: string; category: string }>;
    edges: Array<{ source: string; target: string; label: string }>;
  };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function buildProjectContext(projectId: string): Promise<ProjectContext> {
  const project = await (await import("../../models/Project.js")).Project.findById(projectId).lean();
  if (!project) {
    throw new Error("Project not found");
  }

  const context: ProjectContext = {
    project: {
      name: project.name,
      description: project.description,
      type: project.type,
      experienceLevel: project.experienceLevel,
      progress: project.progress,
    },
  };

  if (project.analysisId) {
    const analysis = await Analysis.findById(project.analysisId).lean();
    if (analysis) {
      context.analysis = {
        summary: analysis.summary,
        technicalComplexity: analysis.technicalComplexity,
        mainFeatures: analysis.mainFeatures,
        targetUsers: analysis.targetUsers,
        functionalRequirements: analysis.functionalRequirements,
        nonFunctionalRequirements: analysis.nonFunctionalRequirements,
      };
    }
  }

  if (project.techStackId) {
    const techStack = await TechStack.findById(project.techStackId).lean();
    if (techStack) {
      context.techStack = {
        frontend: techStack.frontend,
        backend: techStack.backend,
        database: techStack.database,
        authentication: techStack.authentication,
        otherServices: techStack.otherServices,
      };
    }
  }

  if (project.roadmapId) {
    const roadmap = await Roadmap.findById(project.roadmapId).lean();
    if (roadmap) {
      context.roadmap = {
        phases: roadmap.phases,
        statistics: roadmap.statistics,
      };
    }
  }

  if (project.architectureId) {
    const architecture = await Architecture.findById(project.architectureId).lean();
    if (architecture) {
      context.architecture = {
        nodes: architecture.nodes.map((n) => ({
          id: n.id,
          label: n.label,
          description: n.description,
          technology: n.technology,
          category: n.category,
        })),
        edges: architecture.edges.map((e) => ({
          source: e.source,
          target: e.target,
          label: e.label,
        })),
      };
    }
  }

  return context;
}

function buildSystemPrompt(context: ProjectContext): string {
  const parts: string[] = [
    "You are an expert AI project assistant for a specific software development project.",
    "You have full access to the project's context including its analysis, tech stack, roadmap, tasks, and architecture.",
    "Answer questions based ONLY on the provided project context.",
    "If the context doesn't contain relevant information, clearly state that you don't have that information.",
    "Be concise, helpful, and reference specific project details when answering.",
    "",
    "=== PROJECT ===",
    `Name: ${context.project.name}`,
    `Description: ${context.project.description}`,
    `Type: ${context.project.type}`,
    `Experience Level: ${context.project.experienceLevel}`,
    `Progress: ${context.project.progress}%`,
  ];

  if (context.analysis) {
    parts.push(
      "",
      "=== ANALYSIS ===",
      `Summary: ${context.analysis.summary}`,
      `Technical Complexity: ${context.analysis.technicalComplexity.level} - ${context.analysis.technicalComplexity.reason}`,
      `Main Features: ${context.analysis.mainFeatures.join(", ") || "None"}`,
      `Target Users: ${context.analysis.targetUsers.join(", ") || "None"}`,
      `Functional Requirements: ${context.analysis.functionalRequirements.join(", ") || "None"}`,
      `Non-Functional Requirements: ${context.analysis.nonFunctionalRequirements.join(", ") || "None"}`,
    );
  }

  if (context.techStack) {
    const techParts: string[] = [];
    if (context.techStack.frontend.length) {
      techParts.push(
        `Frontend: ${context.techStack.frontend.map((t) => `${t.name} (${t.reason})`).join(", ")}`
      );
    }
    if (context.techStack.backend.length) {
      techParts.push(
        `Backend: ${context.techStack.backend.map((t) => `${t.name} (${t.reason})`).join(", ")}`
      );
    }
    if (context.techStack.database.length) {
      techParts.push(
        `Database: ${context.techStack.database.map((t) => `${t.name} (${t.reason})`).join(", ")}`
      );
    }
    if (context.techStack.authentication.length) {
      techParts.push(
        `Auth: ${context.techStack.authentication.map((t) => `${t.name} (${t.reason})`).join(", ")}`
      );
    }
    if (context.techStack.otherServices.length) {
      techParts.push(
        `Other: ${context.techStack.otherServices.map((t) => `${t.name} (${t.reason})`).join(", ")}`
      );
    }
    if (techParts.length) {
      parts.push("", "=== TECH STACK ===", ...techParts);
    }
  }

  if (context.roadmap) {
    const phasesSummary = context.roadmap.phases
      .map((p) => {
        const completed = p.tasks.filter((t) => t.status === "completed").length;
        const total = p.tasks.length;
        return `Phase ${p.phaseNumber}: ${p.title} (${completed}/${total} tasks ${p.difficulty})`;
      })
      .join("\n");

    parts.push(
      "",
      "=== ROADMAP ===",
      `Overall Progress: ${context.roadmap.statistics.progress}%`,
      `Total Tasks: ${context.roadmap.statistics.totalTasks}`,
      `Completed: ${context.roadmap.statistics.completedTasks}, In Progress: ${context.roadmap.statistics.inProgressTasks}, Not Started: ${context.roadmap.statistics.notStartedTasks}, Blocked: ${context.roadmap.statistics.blockedTasks}`,
      "",
      "Phases:",
      phasesSummary,
    );
  }

  if (context.architecture) {
    const nodesSummary = context.architecture.nodes
      .map((n) => `${n.label} (${n.category}: ${n.technology})`)
      .join(", ");
    const edgesSummary = context.architecture.edges
      .map((e) => `${e.source} -> ${e.target} (${e.label})`)
      .join(", ");

    parts.push(
      "",
      "=== ARCHITECTURE ===",
      `Components: ${nodesSummary}`,
      `Connections: ${edgesSummary}`,
    );
  }

  parts.push(
    "",
    "=== INSTRUCTIONS ===",
    "- Answer questions about this specific project using the context above",
    "- Reference specific project details (tech choices, roadmap tasks, architecture components)",
    "- If asked about next steps, look at roadmap tasks that are not started or in progress, considering dependencies",
    "- If asked about architecture, reference actual nodes and connections",
    "- If asked about tech choices, explain the reasoning from the tech stack context",
    "- If information is not available in context, say so clearly",
    "- Be concise and actionable",
  );

  return parts.join("\n");
}

async function getRecentChatHistory(projectId: string, userId: string, limit = 10): Promise<ChatMessage[]> {
  const chat = await Chat.findOne({ projectId, userId }).lean();
  if (!chat || !chat.messages?.length) {
    return [];
  }
  const recent = chat.messages.slice(-limit);
  return recent.map((m) => ({ role: m.role, content: m.content }));
}

export async function sendMessage(
  projectId: string,
  userId: string,
  userMessage: string
): Promise<{ response: string; chat: any }> {
  const context = await buildProjectContext(projectId);
  const history = await getRecentChatHistory(projectId, userId);

  const systemPrompt = buildSystemPrompt(context);

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history,
    { role: "user" as const, content: userMessage },
  ];

  const aiResponse = await generateAIResponse(messages);

  let chat = await Chat.findOne({ projectId, userId });
  if (!chat) {
    chat = new Chat({ projectId, userId, messages: [] });
  }

  chat.messages.push(
    { role: "user", content: userMessage, timestamp: new Date() },
    { role: "assistant", content: aiResponse, timestamp: new Date() }
  );

  await chat.save();

  return {
    response: aiResponse,
    chat,
  };
}

export async function getChatHistory(projectId: string, userId: string): Promise<ChatMessage[]> {
  const chat = await Chat.findOne({ projectId, userId }).lean();
  return chat?.messages || [];
}

export async function clearChatHistory(projectId: string, userId: string): Promise<void> {
  await Chat.deleteOne({ projectId, userId });
}