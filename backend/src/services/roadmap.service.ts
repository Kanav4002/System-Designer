import { Roadmap } from "../models/Roadmap.js";
import { Project } from "../models/Project.js";
import { Types } from "mongoose";

export interface TaskProgressStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  blockedTasks: number;
  progress: number;
}

export interface PhaseProgressStats {
  phaseNumber: number;
  phaseTitle: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  blockedTasks: number;
  progress: number;
  status: "not_started" | "in_progress" | "completed" | "blocked";
}

function calculatePhaseStats(phase: any): PhaseProgressStats {
  const tasks = phase.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
  const inProgressTasks = tasks.filter((t: any) => t.status === "in_progress").length;
  const notStartedTasks = tasks.filter((t: any) => t.status === "not_started").length;
  const blockedTasks = tasks.filter((t: any) => t.status === "blocked").length;

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  let status: "not_started" | "in_progress" | "completed" | "blocked";
  if (totalTasks === 0) {
    status = "not_started";
  } else if (completedTasks === totalTasks) {
    status = "completed";
  } else if (blockedTasks > 0 && inProgressTasks === 0 && completedTasks === 0) {
    status = "blocked";
  } else if (inProgressTasks > 0 || completedTasks > 0) {
    status = "in_progress";
  } else {
    status = "not_started";
  }

  return {
    phaseNumber: phase.phaseNumber,
    phaseTitle: phase.title,
    totalTasks,
    completedTasks,
    inProgressTasks,
    notStartedTasks,
    blockedTasks,
    progress,
    status,
  };
}

function calculateRoadmapStats(phases: any[]): TaskProgressStats {
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  let notStartedTasks = 0;
  let blockedTasks = 0;

  for (const phase of phases) {
    const tasks = phase.tasks || [];
    totalTasks += tasks.length;
    completedTasks += tasks.filter((t: any) => t.status === "completed").length;
    inProgressTasks += tasks.filter((t: any) => t.status === "in_progress").length;
    notStartedTasks += tasks.filter((t: any) => t.status === "not_started").length;
    blockedTasks += tasks.filter((t: any) => t.status === "blocked").length;
  }

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    notStartedTasks,
    blockedTasks,
    progress,
  };
}

function updateRoadmapStatistics(roadmap: any): void {
  const stats = calculateRoadmapStats(roadmap.phases);
  roadmap.statistics = stats;

  for (const phase of roadmap.phases) {
    const phaseStats = calculatePhaseStats(phase);
    phase.totalTasks = phaseStats.totalTasks;
    phase.completedTasks = phaseStats.completedTasks;
    phase.progress = phaseStats.progress;
  }
}

export async function findRoadmapByProjectId(projectId: string) {
  return Roadmap.findOne({ projectId });
}

export async function getAllTasksWithProgress(projectId: string) {
  const roadmap = await Roadmap.findOne({ projectId });
  if (!roadmap) return null;

  const tasks: any[] = [];
  roadmap.phases.forEach((phase) => {
    phase.tasks.forEach((task: any, taskIndex: number) => {
      tasks.push({
        id: `${phase.phaseNumber}-${taskIndex}`,
        phaseId: phase.phaseNumber,
        phaseTitle: phase.title,
        phaseNumber: phase.phaseNumber,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        estimatedHours: task.estimatedHours,
        dependencies: task.dependencies,
        order: task.order,
      });
    });
  });

  const progress = calculateRoadmapStats(roadmap.phases);
  const phaseProgress = roadmap.phases.map(calculatePhaseStats);

  return { tasks, progress, phaseProgress, roadmap };
}



export async function getTaskByCompositeId(projectId: string, taskId: string) {
  const roadmap = await Roadmap.findOne({ projectId });
  if (!roadmap) return null;

  const [phaseNumberStr, taskIndexStr] = taskId.split("-");
  const phaseNumber = parseInt(phaseNumberStr, 10);
  const taskIndex = parseInt(taskIndexStr, 10);

  const phase = roadmap.phases.find((p: any) => p.phaseNumber === phaseNumber);
  if (!phase) return null;

  const task = phase.tasks[taskIndex];
  if (!task) return null;

  return { roadmap, phase, task, phaseNumber, taskIndex };
}

export async function updateTaskStatus(projectId: string, taskId: string, status: "not_started" | "in_progress" | "completed" | "blocked") {
  const result = await getTaskByCompositeId(projectId, taskId);
  if (!result) return null;

  const { roadmap, task } = result;
  task.status = status;

  updateRoadmapStatistics(roadmap);
  await roadmap.save();

  const project = await Project.findById(projectId);
  if (project) {
    project.progress = roadmap.statistics.progress;
    await project.save();
  }

  return {
    task: {
      id: taskId,
      phaseId: result.phaseNumber,
      phaseTitle: result.phase.title,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      dependencies: task.dependencies,
      order: task.order,
    },
    progress: roadmap.statistics,
    phaseProgress: roadmap.phases.map(calculatePhaseStats),
  };
}

export async function updateTaskDetails(
  projectId: string,
  taskId: string,
  updates: { title?: string; description?: string; priority?: "low" | "medium" | "high"; estimatedHours?: number; dependencies?: string[] }
) {
  const result = await getTaskByCompositeId(projectId, taskId);
  if (!result) return null;

  const { roadmap, task } = result;

  if (updates.title !== undefined) task.title = updates.title;
  if (updates.description !== undefined) task.description = updates.description;
  if (updates.priority !== undefined) task.priority = updates.priority;
  if (updates.estimatedHours !== undefined) task.estimatedHours = updates.estimatedHours;
  if (updates.dependencies !== undefined) task.dependencies = updates.dependencies;

  updateRoadmapStatistics(roadmap);
  await roadmap.save();

  return {
    task: {
      id: taskId,
      phaseId: result.phaseNumber,
      phaseTitle: result.phase.title,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      dependencies: task.dependencies,
      order: task.order,
    },
    progress: roadmap.statistics,
    phaseProgress: roadmap.phases.map(calculatePhaseStats),
  };
}

export async function deleteTask(projectId: string, taskId: string) {
  const result = await getTaskByCompositeId(projectId, taskId);
  if (!result) return null;

  const { roadmap, phase, taskIndex } = result;
  const deletedTask = phase.tasks[taskIndex];

  phase.tasks.splice(taskIndex, 1);

  updateRoadmapStatistics(roadmap);
  await roadmap.save();

  const project = await Project.findById(projectId);
  if (project) {
    project.progress = roadmap.statistics.progress;
    await project.save();
  }

  return {
    deletedTask: {
      id: taskId,
      title: deletedTask.title,
    },
    progress: roadmap.statistics,
    phaseProgress: roadmap.phases.map(calculatePhaseStats),
  };
}

export async function createTask(
  projectId: string,
  data: { title: string; description: string; priority: string; estimatedHours: number; dependencies: string[]; phase: number }
) {
  const roadmap = await Roadmap.findOne({ projectId });
  if (!roadmap) return null;

  const phase = roadmap.phases.find((p: any) => p.phaseNumber === data.phase);
  if (!phase) return null;

  const newTask = {
    title: data.title,
    description: data.description,
    order: phase.tasks.length,
    estimatedHours: data.estimatedHours,
    priority: data.priority,
    status: "not_started" as const,
    dependencies: data.dependencies,
  };

  phase.tasks.push(newTask as any);

  updateRoadmapStatistics(roadmap);
  await roadmap.save();

  const project = await Project.findById(projectId);
  if (project) {
    project.progress = roadmap.statistics.progress;
    await project.save();
  }

  const newTaskIndex = phase.tasks.length - 1;
  const taskId = `${data.phase}-${newTaskIndex}`;

  return {
    task: {
      id: taskId,
      phaseId: data.phase,
      phaseTitle: phase.title,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      estimatedHours: newTask.estimatedHours,
      dependencies: newTask.dependencies,
      order: newTask.order,
    },
    progress: roadmap.statistics,
    phaseProgress: roadmap.phases.map(calculatePhaseStats),
  };
}