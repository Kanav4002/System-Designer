import mongoose, { Schema, Document } from "mongoose";

export type TechnicalComplexityLevel = "Low" | "Medium" | "High" | "Very High";

export interface ITechnicalComplexity {
  level: TechnicalComplexityLevel;
  reason: string;
}

export interface IAnalysis extends Document {
  projectId: mongoose.Types.ObjectId;
  summary: string;
  technicalComplexity: ITechnicalComplexity;
  estimatedPhases: number;
  mainFeatures: string[];
  targetUsers: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

const technicalComplexitySchema = new Schema<ITechnicalComplexity>(
  {
    level: {
      type: String,
      enum: ["Low", "Medium", "High", "Very High"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const analysisSchema = new Schema<IAnalysis>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    technicalComplexity: {
      type: technicalComplexitySchema,
      required: true,
    },
    estimatedPhases: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    mainFeatures: {
      type: [String],
      default: [],
    },
    targetUsers: {
      type: [String],
      default: [],
    },
    functionalRequirements: {
      type: [String],
      default: [],
    },
    nonFunctionalRequirements: {
      type: [String],
      default: [],
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

export const Analysis = mongoose.model<IAnalysis>("Analysis", analysisSchema);