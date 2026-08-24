import mongoose, { Schema, Document } from "mongoose";

export interface ITechItem {
  name: string;
  description: string;
  reason: string;
  alternatives: string[];
}

export interface ITechStack extends Document {
  projectId: mongoose.Types.ObjectId;
  frontend: ITechItem[];
  backend: ITechItem[];
  database: ITechItem[];
  authentication: ITechItem[];
  otherServices: ITechItem[];
  createdAt: Date;
  updatedAt: Date;
}

const techItemSchema = new Schema<ITechItem>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    alternatives: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const techStackSchema = new Schema<ITechStack>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
      index: true,
    },
    frontend: {
      type: [techItemSchema],
      default: [],
    },
    backend: {
      type: [techItemSchema],
      default: [],
    },
    database: {
      type: [techItemSchema],
      default: [],
    },
    authentication: {
      type: [techItemSchema],
      default: [],
    },
    otherServices: {
      type: [techItemSchema],
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

export const TechStack = mongoose.model<ITechStack>("TechStack", techStackSchema);