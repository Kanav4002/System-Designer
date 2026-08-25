export interface ArchitectureNodePosition {
  x: number;
  y: number;
}

export interface ArchitectureNode {
  id: string;
  type: string;
  label: string;
  description: string;
  technology: string;
  category: string;
  position: ArchitectureNodePosition;
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
}

export interface ArchitectureData {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

export type ArchitectureCategory = 
  | "frontend"
  | "backend"
  | "database"
  | "authentication"
  | "ai"
  | "external_service"
  | "cache"
  | "storage"
  | "queue"
  | "api"
  | "service"
  | "other";

export type EdgeType = "default" | "animated" | "step" | "smoothstep";