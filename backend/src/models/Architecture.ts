import mongoose, { Schema, Document } from "mongoose";

export interface IArchitectureNode {
  id: string;
  type: string;
  label: string;
  description: string;
  technology: string;
  category: string;
  position: {
    x: number;
    y: number;
  };
}

export interface IArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
}

export interface IArchitecture extends Document {
  projectId: mongoose.Types.ObjectId;
  nodes: IArchitectureNode[];
  edges: IArchitectureEdge[];
  createdAt: Date;
  updatedAt: Date;
}

const architectureNodeSchema = new Schema<IArchitectureNode>(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    technology: { type: String, required: true },
    category: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
  },
  { _id: false }
);

const architectureEdgeSchema = new Schema<IArchitectureEdge>(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
  },
  { _id: false }
);

const architectureSchema = new Schema<IArchitecture>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
      index: true,
    },
    nodes: [architectureNodeSchema],
    edges: [architectureEdgeSchema],
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

export const Architecture = mongoose.model<IArchitecture>("Architecture", architectureSchema);