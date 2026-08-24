export type TechCategory =
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Other Services'
  | 'DevOps'
  | 'Mobile';

export interface TechItem {
  id: string;
  category: TechCategory;
  technology: string;
  reason: string;
  alternatives: string[];
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface Task {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  estimatedTime: string;
  dependencies: string[];
  order: number;
}

export type PhaseStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';

export interface RoadmapPhase {
  id: string;
  projectId: string;
  title: string;
  description: string;
  order: number;
  status: PhaseStatus;
  difficulty: TaskDifficulty;
}

export interface ProjectAnalysis {
  summary: string;
  mainFeatures: string[];
  targetUsers: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  technicalComplexity: {
    level: 'Low' | 'Medium' | 'High' | 'Very High';
    reason: string;
  };
  estimatedPhases: number;
}

export type ArchNodeType =
  | 'Frontend'
  | 'Backend API'
  | 'API Gateway'
  | 'Auth Service'
  | 'Database'
  | 'Cache'
  | 'Queue'
  | 'Storage'
  | 'Payment Service'
  | 'External API'
  | 'Microservice';

export interface ArchNodeData {
  label: string;
  type: ArchNodeType;
  description: string;
  technology: string;
  responsibilities: string[];
}

export interface ChatMessage {
  id: string;
  projectId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Project {
  _id: string;
  id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  currentPhase: string;
  techStack: TechItem[];
  analysis: ProjectAnalysis;
  phases: RoadmapPhase[];
  tasks: Task[];
  archNodes: ArchNodeData[];
  archEdges: { id: string; source: string; target: string }[];
  chat: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiProject {
  _id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  analysisId?: string;
  techStackId?: string;
  roadmapId?: string;
  architectureId?: string;
  createdAt: string;
  updatedAt: string;
}
