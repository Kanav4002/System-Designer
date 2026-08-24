import { Request, Response } from "express";
import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { TechStack } from "../models/TechStack.js";
import { Analysis } from "../models/Analysis.js";
import { generateTechStack as generateTechStackAI } from "../services/ai/techStack.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const generateTechStack = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
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

    let techStack = await TechStack.findOne({ projectId: project._id });

    const analysis = await Analysis.findOne({ projectId: project._id });

    const analysisData = analysis
      ? {
          summary: analysis.summary,
          mainFeatures: analysis.mainFeatures,
          technicalComplexity: analysis.technicalComplexity,
          estimatedPhases: analysis.estimatedPhases,
        }
      : undefined;

    const techStackData = await generateTechStackAI(
      project.name,
      project.description,
      project.type,
      project.experienceLevel,
      analysisData
    );

    if (techStack) {
      techStack.frontend = techStackData.frontend;
      techStack.backend = techStackData.backend;
      techStack.database = techStackData.database;
      techStack.authentication = techStackData.authentication;
      techStack.otherServices = techStackData.otherServices;
      await techStack.save();
    } else {
      techStack = await TechStack.create({
        projectId: project._id,
        ...techStackData,
      });
    }

    project.techStackId = techStack._id;
    await project.save();

    res.status(200).json({
      success: true,
      message: "Tech stack generated successfully",
      techStack,
    });
  } catch (error: any) {
    console.error("Generate tech stack error:", error);

    if (error.message.includes("invalid JSON") || error.message.includes("validation failed")) {
      res.status(502).json({
        success: false,
        message: "AI service returned invalid response",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTechStack = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
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

    const techStack = await TechStack.findOne({ projectId: project._id });

    if (!techStack) {
      res.status(404).json({
        success: false,
        message: "Tech stack not found for this project",
      });
      return;
    }

    res.status(200).json({
      success: true,
      techStack,
    });
  } catch (error) {
    console.error("Get tech stack error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateTechStack = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
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

    const techStack = await TechStack.findOne({ projectId: project._id });

    if (!techStack) {
      res.status(404).json({
        success: false,
        message: "Tech stack not found for this project",
      });
      return;
    }

    const { frontend, backend, database, authentication, otherServices } = req.body;

    if (frontend !== undefined) techStack.frontend = frontend;
    if (backend !== undefined) techStack.backend = backend;
    if (database !== undefined) techStack.database = database;
    if (authentication !== undefined) techStack.authentication = authentication;
    if (otherServices !== undefined) techStack.otherServices = otherServices;

    await techStack.save();

    res.status(200).json({
      success: true,
      message: "Tech stack updated successfully",
      techStack,
    });
  } catch (error) {
    console.error("Update tech stack error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};