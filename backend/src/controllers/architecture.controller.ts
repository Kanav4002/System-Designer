import { Request, Response } from "express";
import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { Analysis } from "../models/Analysis.js";
import { TechStack } from "../models/TechStack.js";
import { Roadmap } from "../models/Roadmap.js";
import { Architecture } from "../models/Architecture.js";
import { generateArchitecture } from "../services/ai/architecture.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const generateArchitectureHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
      return;
    }

    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
      return;
    }

    const project = await Project.findOne({ _id: id, userId: req.userId });

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    let analysisData = undefined;
    if (project.analysisId) {
      const analysis = await Analysis.findById(project.analysisId);
      if (analysis) {
        analysisData = {
          summary: analysis.summary,
          mainFeatures: analysis.mainFeatures,
          technicalComplexity: analysis.technicalComplexity,
          estimatedPhases: analysis.estimatedPhases,
        };
      }
    }

    let techStackData = undefined;
    if (project.techStackId) {
      const techStack = await TechStack.findById(project.techStackId);
      if (techStack) {
        techStackData = {
          frontend: techStack.frontend,
          backend: techStack.backend,
          database: techStack.database,
          authentication: techStack.authentication,
          otherServices: techStack.otherServices,
        };
      }
    }

    let roadmapData = undefined;
    if (project.roadmapId) {
      const roadmap = await Roadmap.findById(project.roadmapId);
      if (roadmap) {
        roadmapData = {
          phases: roadmap.phases,
        };
      }
    }

    const architectureData = await generateArchitecture(
      project.name,
      project.description,
      project.type,
      project.experienceLevel,
      analysisData,
      techStackData,
      roadmapData
    );

    const existingArchitecture = await Architecture.findOne({ projectId: id });
    if (existingArchitecture) {
      existingArchitecture.nodes = architectureData.nodes as any;
      existingArchitecture.edges = architectureData.edges as any;
      await existingArchitecture.save();
      return res.status(200).json({ success: true, message: "Architecture updated successfully", architecture: existingArchitecture });
    }

    const architecture = new Architecture({
      projectId: id,
      nodes: architectureData.nodes,
      edges: architectureData.edges,
    });
    await architecture.save();

    project.architectureId = architecture._id as any;
    await project.save();

    return res.status(201).json({ success: true, message: "Architecture generated successfully", architecture });
  } catch (error: any) {
    console.error("Architecture generation error:", error.message, error.stack);

    if (error.message.includes("invalid") || error.message.includes("validation") || error.message.includes("structure")) {
      res.status(502).json({
        success: false,
        message: "AI service returned invalid architecture response",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate architecture",
    });
  }
};

export const getArchitectureHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
      return;
    }

    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
      return;
    }

    const project = await Project.findOne({ _id: id, userId: req.userId });

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    const architecture = await Architecture.findOne({ projectId: id });

    if (!architecture) {
      res.status(404).json({
        success: false,
        message: "Architecture not found for this project",
      });
      return;
    }

    res.status(200).json({
      success: true,
      architecture,
    });
  } catch (error) {
    console.error("Get architecture error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateArchitectureHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
      return;
    }

    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
      return;
    }

    const project = await Project.findOne({ _id: id, userId: req.userId });

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    const architecture = await Architecture.findOne({ projectId: id });

    if (!architecture) {
      res.status(404).json({
        success: false,
        message: "Architecture not found for this project",
      });
      return;
    }

    const { nodes, edges } = req.body;

    if (nodes !== undefined) architecture.nodes = nodes as any;
    if (edges !== undefined) architecture.edges = edges as any;

    await architecture.save();

    res.status(200).json({
      success: true,
      message: "Architecture updated successfully",
      architecture,
    });
  } catch (error) {
    console.error("Update architecture error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};