import { Request, Response } from "express";
import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { Roadmap } from "../models/Roadmap.js";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from "../validators/task.validator.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  findRoadmapByProjectId,
  getAllTasksWithProgress,
  getTaskByCompositeId,
  updateTaskStatus as updateTaskStatusService,
  updateTaskDetails,
  deleteTask as deleteTaskService,
  createTask as createTaskService,
} from "../services/roadmap.service.js";

function validateObjectId(id: string, res: Response): boolean {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid project ID",
    });
    return false;
  }
  return true;
}

async function findProjectAndRoadmap(
  projectId: string,
  userId: string,
  res: Response
): Promise<{ project: any; roadmap: any } | null> {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    res.status(404).json({ success: false, message: "Project not found" });
    return null;
  }

  const roadmap = await findRoadmapByProjectId(projectId);
  if (!roadmap) {
    res.status(404).json({ success: false, message: "Roadmap not found for this project" });
    return null;
  }

  return { project, roadmap };
}

export const getProjectTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const id = req.params.id as string;

    if (!validateObjectId(id, res)) return;

    const result = await findProjectAndRoadmap(id, req.userId, res);
    if (!result) return;

    const taskData = await getAllTasksWithProgress(id);
    if (!taskData) {
      res.status(404).json({ success: false, message: "Roadmap data not found" });
      return;
    }

    const { tasks, progress, phaseProgress } = taskData;

    res.status(200).json({
      success: true,
      tasks: tasks || [],
      progress: progress || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        notStartedTasks: 0,
        blockedTasks: 0,
        progress: 0,
      },
      phaseProgress: phaseProgress || [],
    });
  } catch (error) {
    console.error("Get project tasks error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const projectId = req.params.id as string;
    const taskId = req.params.taskId as string;

    if (!validateObjectId(projectId, res)) return;

    const result = await findProjectAndRoadmap(projectId, req.userId, res);
    if (!result) return;

    const taskResult = await getTaskByCompositeId(projectId, taskId);
    if (!taskResult) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    const { task, phaseNumber, phase } = taskResult;

    res.status(200).json({
      success: true,
      task: {
        id: taskId,
        phaseId: phaseNumber,
        phaseTitle: phase.title,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        estimatedHours: task.estimatedHours,
        dependencies: task.dependencies,
        order: task.order,
      },
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const projectId = req.params.id as string;
    const taskId = req.params.taskId as string;

    if (!validateObjectId(projectId, res)) return;

    const validation = updateTaskStatusSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.format(),
      });
      return;
    }

    const { status } = validation.data as UpdateTaskStatusInput;

    const result = await findProjectAndRoadmap(projectId, req.userId, res);
    if (!result) return;

    const updated = await updateTaskStatusService(projectId, taskId, status);
    if (!updated) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      task: updated.task,
      progress: updated.progress,
      phaseProgress: updated.phaseProgress,
    });
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const projectId = req.params.id as string;
    const taskId = req.params.taskId as string;

    if (!validateObjectId(projectId, res)) return;

    const validation = updateTaskSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.format(),
      });
      return;
    }

    const updates = validation.data as UpdateTaskInput;

    const result = await findProjectAndRoadmap(projectId, req.userId, res);
    if (!result) return;

    const updated = await updateTaskDetails(projectId, taskId, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updated.task,
      progress: updated.progress,
      phaseProgress: updated.phaseProgress,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const projectId = req.params.id as string;
    const taskId = req.params.taskId as string;

    if (!validateObjectId(projectId, res)) return;

    const result = await findProjectAndRoadmap(projectId, req.userId, res);
    if (!result) return;

    const deleted = await deleteTaskService(projectId, taskId);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      deletedTask: deleted.deletedTask,
      progress: deleted.progress,
      phaseProgress: deleted.phaseProgress,
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const projectId = req.params.id as string;

    if (!validateObjectId(projectId, res)) return;

    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.format(),
      });
      return;
    }

    const data = validation.data as CreateTaskInput;

    const result = await findProjectAndRoadmap(projectId, req.userId, res);
    if (!result) return;

    const created = await createTaskService(projectId, data);
    if (!created) {
      res.status(404).json({ success: false, message: "Phase not found" });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: created.task,
      progress: created.progress,
      phaseProgress: created.phaseProgress,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};