import mongoose, { Schema, Document } from "mongoose";

export type ProjectStatus = "Planning" | "In Progress" | "Completed" | "On Hold";
export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  type: string;
  experienceLevel: ExperienceLevel;
  status: ProjectStatus;
  progress: number;
  analysisId?: mongoose.Types.ObjectId;
  techStackId?: mongoose.Types.ObjectId;
  roadmapId?: mongoose.Types.ObjectId;
  architectureId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "Web Application",
    },
    experienceLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Beginner",
    },
    status: {
      type: String,
      enum: ["Planning", "In Progress", "Completed", "On Hold"],
      default: "Planning",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    analysisId: {
      type: Schema.Types.ObjectId,
      ref: "Analysis",
    },
    techStackId: {
      type: Schema.Types.ObjectId,
      ref: "TechStack",
    },
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: "Roadmap",
    },
    architectureId: {
      type: Schema.Types.ObjectId,
      ref: "Architecture",
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

projectSchema.index({ userId: 1, createdAt: -1 });

export const Project = mongoose.model<IProject>("Project", projectSchema);