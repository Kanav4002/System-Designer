import mongoose, { Schema, Document } from "mongoose";

export interface IRoadmapPhase {
  phaseNumber: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  order: number;
  tasks: {
    title: string;
    description: string;
    order: number;
    estimatedHours: number;
    priority: "low" | "medium" | "high";
    status: "not_started" | "in_progress" | "completed" | "blocked";
    dependencies: string[];
  }[];
}

export interface IRoadmap extends Document {
  projectId: mongoose.Types.ObjectId;
  phases: IRoadmapPhase[];
  statistics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    notStartedTasks: number;
    blockedTasks: number;
    progress: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const roadmapPhaseSchema = new Schema<IRoadmapPhase>({
  phaseNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  order: { type: Number, required: true },
  tasks: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      order: { type: Number, required: true },
      estimatedHours: { type: Number, required: true },
      priority: { type: String, enum: ["low", "medium", "high"], required: true },
      status: { type: String, enum: ["not_started", "in_progress", "completed", "blocked"], default: "not_started" },
      dependencies: [{ type: String }],
    },
  ],
});

const roadmapSchema = new Schema<IRoadmap>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    phases: [roadmapPhaseSchema],
    statistics: {
      totalTasks: { type: Number, default: 0 },
      completedTasks: { type: Number, default: 0 },
      inProgressTasks: { type: Number, default: 0 },
      notStartedTasks: { type: Number, default: 0 },
      blockedTasks: { type: Number, default: 0 },
      progress: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Roadmap = mongoose.model<IRoadmap>("Roadmap", roadmapSchema);
