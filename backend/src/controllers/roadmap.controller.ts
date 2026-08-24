import { Request, Response } from "express";
import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { Roadmap } from "../models/Roadmap.js";
import { Analysis } from "../models/Analysis.js";
import { TechStack } from "../models/TechStack.js";
import { generateRoadmap as generateRoadmapAI } from "../services/ai/roadmap.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const calculateRoadmapStatistics = (roadmap: any) => {
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  let notStartedTasks = 0;
  let blockedTasks = 0;

  roadmap.phases.forEach((phase: any) => {
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

const calculatePhaseStatus = (phase: any): string => {
  if (phase.tasks.length === 0) return "not_started";

  const completed = phase.tasks.filter((t: any) => t.status === "completed").length;
  const inProgress = phase.tasks.filter((t: any) => t.status === "in_progress").length;
  const blocked = phase.tasks.filter((t: any) => t.status === "blocked").length;

  if (completed === phase.tasks.length) return "completed";
  if (inProgress > 0 || blocked > 0 || completed > 0) return "in_progress";
  return "not_started";
};

export const generateRoadmap = async (
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

    let roadmap = await Roadmap.findOne({ projectId: project._id });

    const analysis = await Analysis.findOne({ projectId: project._id });

    const analysisData = analysis
      ? {
          summary: analysis.summary,
          mainFeatures: analysis.mainFeatures,
          technicalComplexity: analysis.technicalComplexity,
          estimatedPhases: analysis.estimatedPhases,
        }
      : undefined;

    const techStack = await TechStack.findOne({ projectId: project._id });

    const techStackData = techStack
      ? {
          frontend: techStack.frontend,
          backend: techStack.backend,
          database: techStack.database,
          authentication: techStack.authentication,
          otherServices: techStack.otherServices,
        }
      : undefined;

    const roadmapData = await generateRoadmapAI(
      project.name,
      project.description,
      project.type,
      project.experienceLevel,
      analysisData,
      techStackData
    );

    const phasesWithStatus = roadmapData.phases.map((phase, index) => ({
      ...phase,
      order: index + 1,
      phaseNumber: index + 1,
    }));

    if (roadmap) {
      roadmap.phases = phasesWithStatus as any;
      roadmap.statistics = calculateRoadmapStatistics({ phases: phasesWithStatus });
      await roadmap.save();
    } else {
      const statistics = calculateRoadmapStatistics({ phases: phasesWithStatus });
      roadmap = await Roadmap.create({
        projectId: project._id,
        phases: phasesWithStatus as any,
        statistics,
      });
    }

    project.roadmapId = roadmap._id;
    await project.save();

    const responseRoadmap = {
      ...roadmap.toObject(),
      phases: roadmap.phases.map((phase: any) => ({
        ...phase.toObject?.() || phase,
        status: calculatePhaseStatus(phase),
        totalTasks: phase.tasks.length,
        completedTasks: phase.tasks.filter((t: any) => t.status === "completed").length,
        progress: phase.tasks.length > 0
          ? Math.round((phase.tasks.filter((t: any) => t.status === "completed").length / phase.tasks.length) * 100)
          : 0,
      })),
      statistics: roadmap.statistics,
    };

    res.status(200).json({
      success: true,
      message: "Roadmap generated successfully",
      roadmap: responseRoadmap,
    });
  } catch (error: any) {
    console.error("Generate roadmap error:", error);

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

export const getRoadmap = async (
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

    const roadmap = await Roadmap.findOne({ projectId: project._id });

    if (!roadmap) {
      res.status(404).json({
        success: false,
        message: "Roadmap not found for this project",
      });
      return;
    }

    const responseRoadmap = {
      ...roadmap.toObject(),
      phases: roadmap.phases.map((phase: any) => ({
        ...phase.toObject?.() || phase,
        status: calculatePhaseStatus(phase),
        totalTasks: phase.tasks.length,
        completedTasks: phase.tasks.filter((t: any) => t.status === "completed").length,
        progress: phase.tasks.length > 0
          ? Math.round((phase.tasks.filter((t: any) => t.status === "completed").length / phase.tasks.length) * 100)
          : 0,
      })),
      statistics: roadmap.statistics,
    };

    res.status(200).json({
      success: true,
      roadmap: responseRoadmap,
    });
  } catch (error) {
    console.error("Get roadmap error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};