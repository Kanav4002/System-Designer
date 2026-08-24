import { Request, Response } from "express";
import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { Analysis } from "../models/Analysis.js";
import { generateProjectAnalysis } from "../services/ai/analysis.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const generateAnalysis = async (
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

    let analysis = await Analysis.findOne({ projectId: project._id });

    const analysisData = await generateProjectAnalysis(
      project.name,
      project.description,
      project.type,
      project.experienceLevel
    );

    if (analysis) {
      analysis.summary = analysisData.summary;
      analysis.technicalComplexity = analysisData.technicalComplexity;
      analysis.estimatedPhases = analysisData.estimatedPhases;
      analysis.mainFeatures = analysisData.mainFeatures;
      analysis.targetUsers = analysisData.targetUsers;
      analysis.functionalRequirements = analysisData.functionalRequirements;
      analysis.nonFunctionalRequirements = analysisData.nonFunctionalRequirements;
      await analysis.save();
    } else {
      analysis = await Analysis.create({
        projectId: project._id,
        ...analysisData,
      });
    }

    project.analysisId = analysis._id;
    await project.save();

    res.status(200).json({
      success: true,
      message: "Analysis generated successfully",
      analysis,
    });
  } catch (error: any) {
    console.error("Generate analysis error:", error.message, error.stack);

    if (error.message.includes("invalid JSON") || error.message.includes("validation failed")) {
      res.status(502).json({
        success: false,
        message: "AI service returned invalid response",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getAnalysis = async (
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

    const analysis = await Analysis.findOne({ projectId: project._id });

    if (!analysis) {
      res.status(404).json({
        success: false,
        message: "Analysis not found for this project",
      });
      return;
    }

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Get analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};