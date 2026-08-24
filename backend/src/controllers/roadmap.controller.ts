import { Request, Response } from "express";
import { Roadmap } from "../models/Roadmap.js";
import { Project } from "../models/Project.js";
import { Analysis } from "../models/Analysis.js";
import { TechStack } from "../models/TechStack.js";
import { generateRoadmap } from "../services/ai/roadmap.service.js";

export const generateRoadmapHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const project = await Project.findOne({ _id: id, userId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
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

    const roadmapData = await generateRoadmap(
      project.name,
      project.description,
      project.type,
      project.experienceLevel,
      analysisData,
      techStackData
    );

    const existingRoadmap = await Roadmap.findOne({ projectId: id });
    if (existingRoadmap) {
      existingRoadmap.phases = roadmapData.phases as any;
      await existingRoadmap.save();
      return res.status(200).json({ success: true, message: "Roadmap updated successfully", roadmap: existingRoadmap });
    }

    const roadmap = new Roadmap({
      projectId: id,
      phases: roadmapData.phases,
    });
    await roadmap.save();

    project.roadmapId = roadmap._id as any;
    await project.save();

    return res.status(201).json({ success: true, message: "Roadmap generated successfully", roadmap });
  } catch (error: any) {
    console.error("Roadmap generation error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to generate roadmap" });
  }
};

export const getRoadmapHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const project = await Project.findOne({ _id: id, userId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const roadmap = await Roadmap.findOne({ projectId: id });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    return res.status(200).json({ success: true, roadmap });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to get roadmap" });
  }
};

export const updateTaskStatusHandler = async (req: Request, res: Response) => {
  try {
    const { id, phaseIndex, taskIndex } = req.params as { id: string; phaseIndex: string; taskIndex: string };
    const { status } = req.body;
    const userId = (req as any).userId;

    const project = await Project.findOne({ _id: id, userId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const roadmap = await Roadmap.findOne({ projectId: id });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    const phase = roadmap.phases[parseInt(phaseIndex)];
    if (!phase) {
      return res.status(404).json({ success: false, message: "Phase not found" });
    }

    const task = phase.tasks[parseInt(taskIndex)];
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    task.status = status;
    await roadmap.save();

    return res.status(200).json({ success: true, message: "Task status updated", roadmap });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to update task" });
  }
};
