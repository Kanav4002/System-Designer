import mongoose, { Schema, Document } from "mongoose";

export type TaskStatus = "not_started" | "in_progress" | "completed" | "blocked";
export type TaskPriority = "low" | "medium" | "high";
export type TaskDifficulty = "easy" | "medium" | "hard";

export interface ITask extends Document {
  title: string;
  description: string;
  order: number;
  estimatedHours: number;
  priority: TaskPriority;
  status: TaskStatus;
  dependencies: string[];
}

export interface IPhase extends Document {
  phaseNumber: number;
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  order: number;
  tasks: ITask[];
}

export interface IRoadmapStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  blockedTasks: number;
  progress: number;
}

export interface IRoadmap extends Document {
  projectId: mongoose.Types.ObjectId;
  phases: IPhase[];
  statistics: IRoadmapStatistics;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    estimatedHours: {
      type: Number,
      required: true,
      min: 0,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "blocked"],
      default: "not_started",
    },
    dependencies: {
      type: [String],
      default: [],
    },
  },
  { _id: true }
);

const phaseSchema = new Schema<IPhase>(
  {
    phaseNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    tasks: [taskSchema],
  },
  { _id: true }
);

const statisticsSchema = new Schema<IRoadmapStatistics>(
  {
    totalTasks: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    inProgressTasks: {
      type: Number,
      default: 0,
    },
    notStartedTasks: {
      type: Number,
      default: 0,
    },
    blockedTasks: {
      type: Number,
      default: 0,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const roadmapSchema = new Schema<IRoadmap>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
      index: true,
    },
    phases: [phaseSchema],
    statistics: {
      type: statisticsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

roadmapSchema.methods.calculateStatistics = function (): IRoadmapStatistics {
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  let notStartedTasks = 0;
  let blockedTasks = 0;

  this.phases.forEach((phase: any) => {
    phase.tasks.forEach((task: any) => {
      totalTasks++;
      switch (task.status) {
        case "completed":
          completedTasks++;
          break;
        case "in_progress":
          inProgressTasks++;
          break;
        case "blocked":
          blockedTasks++;
          break;
        default:
          notStartedTasks++;
          break;
      }
    });
  });

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    notStartedTasks,
    blockedTasks,
    progress,
  };
};

roadmapSchema.methods.calculatePhaseStatus = function (phase: any): string {
  if (phase.tasks.length === 0) return "not_started";

  const completed = phase.tasks.filter((t: any) => t.status === "completed").length;
  const inProgress = phase.tasks.filter((t: any) => t.status === "in_progress").length;
  const blocked = phase.tasks.filter((t: any) => t.status === "blocked").length;

  if (completed === phase.tasks.length) return "completed";
  if (inProgress > 0 || blocked > 0 || completed > 0) return "in_progress";
  return "not_started";
};

export const Roadmap = mongoose.model<IRoadmap>("Roadmap", roadmapSchema);