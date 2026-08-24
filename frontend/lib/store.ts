import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project,
  Task,
  TechItem,
  TechCategory,
  TechStack,
  ArchNodeData,
  ChatMessage,
  TaskStatus,
} from './types';
import { techStackToItems } from './types';
import { projectApi, analysisApi, techStackApi } from './api';

interface AppState {
  projects: Project[];
  theme: 'dark' | 'light';
  isLoading: boolean;

  fetchProjects: () => Promise<void>;
  createProject: (opts: {
    name: string;
    description: string;
    type: string;
    experienceLevel: Project['experienceLevel'];
    mode: 'ai' | 'manual';
    selectedTech?: { category: TechCategory; technology: string }[];
  }) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  fetchAnalysis: (projectId: string) => Promise<void>;
  generateAnalysis: (projectId: string) => Promise<void>;
  fetchTechStack: (projectId: string) => Promise<void>;
  generateTechStack: (projectId: string) => Promise<void>;

  updateTaskStatus: (projectId: string, taskId: string, status: TaskStatus) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  addTask: (projectId: string, phaseId: string, task: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  reorderTasks: (projectId: string, phaseId: string, taskIds: string[]) => void;

  replaceTech: (projectId: string, techId: string, newTechnology: string) => void;
  addTech: (projectId: string, category: TechCategory, technology: string) => void;
  removeTech: (projectId: string, techId: string) => void;

  addArchNode: (projectId: string, node: ArchNodeData) => void;
  updateArchNode: (projectId: string, index: number, updates: Partial<ArchNodeData>) => void;
  removeArchNode: (projectId: string, index: number) => void;
  setArchEdges: (projectId: string, edges: { id: string; source: string; target: string }[]) => void;
  addArchEdge: (projectId: string, source: string, target: string) => void;
  removeArchEdge: (projectId: string, edgeId: string) => void;

  addChatMessage: (projectId: string, role: ChatMessage['role'], content: string) => void;

  recalcProgress: (projectId: string) => void;
}

function computeProgress(project: Project): { progress: number; phaseStatuses: Map<string, TaskStatus> } {
  const tasks = project.tasks;
  if (tasks.length === 0) return { progress: 0, phaseStatuses: new Map() };
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const progress = Math.round((completed / tasks.length) * 100);

  const phaseStatuses = new Map<string, TaskStatus>();
  project.phases.forEach((phase) => {
    const phaseTasks = tasks.filter((t) => t.phaseId === phase.id);
    if (phaseTasks.length === 0) {
      phaseStatuses.set(phase.id, 'Not Started');
      return;
    }
    const phaseCompleted = phaseTasks.filter((t) => t.status === 'Completed').length;
    if (phaseCompleted === phaseTasks.length) {
      phaseStatuses.set(phase.id, 'Completed');
    } else if (phaseCompleted > 0 || phaseTasks.some((t) => t.status === 'In Progress')) {
      phaseStatuses.set(phase.id, 'In Progress');
    } else if (phaseTasks.some((t) => t.status === 'Blocked')) {
      phaseStatuses.set(phase.id, 'Blocked');
    } else {
      phaseStatuses.set(phase.id, 'Not Started');
    }
  });

  return { progress, phaseStatuses };
}

function mapApiProject(apiProject: any): Project {
  return {
    id: apiProject._id,
    _id: apiProject._id,
    userId: apiProject.userId,
    name: apiProject.name,
    description: apiProject.description,
    type: apiProject.type,
    experienceLevel: apiProject.experienceLevel,
    status: apiProject.status,
    progress: apiProject.progress,
    currentPhase: 'Planning',
    techStack: apiProject.techStackId ? {
      _id: apiProject.techStackId,
      projectId: apiProject._id,
      frontend: [],
      backend: [],
      database: [],
      authentication: [],
      otherServices: [],
      createdAt: apiProject.createdAt,
      updatedAt: apiProject.updatedAt,
    } : {
      _id: '',
      projectId: apiProject._id,
      frontend: [],
      backend: [],
      database: [],
      authentication: [],
      otherServices: [],
      createdAt: apiProject.createdAt,
      updatedAt: apiProject.updatedAt,
    },
    analysis: {
      summary: '',
      mainFeatures: [],
      targetUsers: [],
      functionalRequirements: [],
      nonFunctionalRequirements: [],
      technicalComplexity: {
        level: 'Low' as const,
        reason: '',
      },
      estimatedPhases: 0,
    },
    phases: [],
    tasks: [],
    archNodes: [],
    archEdges: [],
    chat: [],
    createdAt: apiProject.createdAt,
    updatedAt: apiProject.updatedAt,
  };
}

import {
  SAMPLE_PROJECTS,
  generateProject,
  findTech,
  uid,
} from './mock-data';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      theme: 'dark',
      isLoading: false,

      fetchProjects: async () => {
        set({ isLoading: true });
        try {
          const response = await projectApi.getAll();
          const projects = response.projects.map(mapApiProject);
          set({ projects, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch projects:', error);
          set({ isLoading: false });
        }
      },

      createProject: async (opts) => {
        const response = await projectApi.create({
          name: opts.name,
          description: opts.description,
          type: opts.type,
          experienceLevel: opts.experienceLevel,
        });
        const project = mapApiProject(response.project);
        set((state) => ({ projects: [project, ...state.projects] }));
        return project.id;
      },

      deleteProject: async (id) => {
        await projectApi.delete(id);
        set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
      },

      getProject: (id) => get().projects.find((p) => p.id === id),

      fetchAnalysis: async (projectId) => {
        try {
          const response = await analysisApi.get(projectId);
          const analysis = response.analysis;
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, analysis } : p
            ),
          }));
        } catch (error: any) {
          if (error.message?.includes('404') || error.message?.includes('not found')) {
            // No analysis exists yet - leave as undefined so UI shows generate button
            return;
          }
          console.error('Failed to fetch analysis:', error);
        }
      },

      generateAnalysis: async (projectId) => {
        try {
          const response = await analysisApi.generate(projectId);
          const analysis = response.analysis;
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, analysis } : p
            ),
          }));
        } catch (error) {
          console.error('Failed to generate analysis:', error);
          throw error;
        }
      },

      fetchTechStack: async (projectId) => {
        try {
          const response = await techStackApi.get(projectId);
          const techStack = response.techStack;
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, techStack } : p
            ),
          }));
        } catch (error: any) {
          if (error.message?.includes('404') || error.message?.includes('not found')) {
            return;
          }
          console.error('Failed to fetch tech stack:', error);
        }
      },

      generateTechStack: async (projectId) => {
        try {
          const response = await techStackApi.generate(projectId);
          const techStack = response.techStack;
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, techStack } : p
            ),
          }));
        } catch (error) {
          console.error('Failed to generate tech stack:', error);
          throw error;
        }
      },

      updateTaskStatus: (projectId, taskId, status) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const tasks = p.tasks.map((t) =>
              t.id === taskId ? { ...t, status } : t
            );
            const updated = { ...p, tasks, updatedAt: new Date().toISOString() };
            const { progress, phaseStatuses } = computeProgress(updated);
            const phases = p.phases.map((ph) => ({
              ...ph,
              status: (phaseStatuses.get(ph.id) as Project['phases'][number]['status']) || ph.status,
            }));
            const currentPhase = phases.find((ph) => ph.status === 'In Progress')?.title ||
              phases.find((ph) => ph.status === 'Not Started')?.title ||
              p.currentPhase;
            return {
              ...updated,
              phases,
              progress,
              currentPhase,
              status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Planning',
            };
          }),
        }));
      },

      updateTask: (projectId, taskId, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  tasks: p.tasks.map((t) =>
                    t.id === taskId ? { ...t, ...updates } : t
                  ),
                  updatedAt: new Date().toISOString(),
                }
          ),
        }));
        get().recalcProgress(projectId);
      },

      addTask: (projectId, phaseId, task) => {
        const project = get().getProject(projectId);
        if (!project) return;
        const phaseTasks = project.tasks.filter((t) => t.phaseId === phaseId);
        const newTask: Task = {
          id: uid('task'),
          phaseId,
          title: task.title || 'New Task',
          description: task.description || '',
          status: task.status || 'Not Started',
          priority: task.priority || 'Medium',
          difficulty: task.difficulty || 'Medium',
          estimatedTime: task.estimatedTime || '4h',
          dependencies: task.dependencies || [],
          order: phaseTasks.length,
        };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id !== projectId ? p : { ...p, tasks: [...p.tasks, newTask], updatedAt: new Date().toISOString() }
          ),
        }));
        get().recalcProgress(projectId);
      },

      deleteTask: (projectId, taskId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id !== projectId ? p : { ...p, tasks: p.tasks.filter((t) => t.id !== taskId), updatedAt: new Date().toISOString() }
          ),
        }));
        get().recalcProgress(projectId);
      },

      reorderTasks: (projectId, phaseId, taskIds) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const phaseTasks = taskIds
              .map((id, idx) => {
                const t = p.tasks.find((t) => t.id === id);
                return t ? { ...t, order: idx } : null;
              })
              .filter((t): t is Task => t !== null);
            const otherTasks = p.tasks.filter((t) => t.phaseId !== phaseId);
            return { ...p, tasks: [...otherTasks, ...phaseTasks], updatedAt: new Date().toISOString() };
          }),
        }));
      },

      replaceTech: (projectId, techId, newTechnology) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const techStack = p.techStack as any;
            const tech = techStackToItems(p.techStack).find((t) => t.id === techId);
            if (!tech) return p;
            const newTech = findTech(tech.category, newTechnology);
            if (!newTech) return p;
            const key = tech.category.toLowerCase() as keyof typeof techStack;
            if (key === 'other services') {
              techStack.otherServices = techStack.otherServices.map((t: any) =>
                t.name === tech.technology ? newTech : t
              );
            } else {
              techStack[key] = techStack[key].map((t: any) =>
                t.name === tech.technology ? newTech : t
              );
            }
            return { ...p, techStack, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      addTech: (projectId, category, technology) => {
        const newTech = findTech(category, technology);
        if (!newTech) return;
        set((state) => ({
          projects: state.projects.map((p) => {
            const techStack = p.techStack as any;
            const key = category.toLowerCase() as keyof typeof techStack;
            const techItem = {
              name: newTech.technology,
              description: newTech.reason,
              reason: newTech.reason,
              alternatives: newTech.alternatives,
            };
            if (key === 'other services') {
              techStack.otherServices = [...techStack.otherServices, techItem];
            } else {
              techStack[key] = [...techStack[key], techItem];
            }
            return { ...p, techStack, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      removeTech: (projectId, techId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            const techStack = p.techStack as any;
            const tech = techStackToItems(p.techStack).find((t) => t.id === techId);
            if (!tech) return p;
            const key = tech.category.toLowerCase() as keyof typeof techStack;
            if (key === 'other services') {
              techStack.otherServices = techStack.otherServices.filter((t: any) => t.name !== tech.technology);
            } else {
              techStack[key] = techStack[key].filter((t: any) => t.name !== tech.technology);
            }
            return { ...p, techStack, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      addArchNode: (projectId, node) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id !== projectId ? p : { ...p, archNodes: [...p.archNodes, node], updatedAt: new Date().toISOString() }
          ),
        }));
      },

      updateArchNode: (projectId, index, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  archNodes: p.archNodes.map((n, i) => (i === index ? { ...n, ...updates } : n)),
                  updatedAt: new Date().toISOString(),
                }
          ),
        }));
      },

      removeArchNode: (projectId, index) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const removedLabel = p.archNodes[index]?.label;
            return {
              ...p,
              archNodes: p.archNodes.filter((_, i) => i !== index),
              archEdges: removedLabel
                ? p.archEdges.filter((e) => e.source !== removedLabel && e.target !== removedLabel)
                : p.archEdges,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      setArchEdges: (projectId, edges) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id !== projectId ? p : { ...p, archEdges: edges, updatedAt: new Date().toISOString() }
          ),
        }));
      },

      addArchEdge: (projectId, source, target) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id !== projectId ? p : { ...p, archEdges: [...p.archEdges, { id: uid('edge'), source, target }], updatedAt: new Date().toISOString() }
          ),
        }));
      },

      removeArchEdge: (projectId, edgeId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id !== projectId ? p : { ...p, archEdges: p.archEdges.filter((e) => e.id !== edgeId), updatedAt: new Date().toISOString() }
          ),
        }));
      },

      addChatMessage: (projectId, role, content) => {
        const msg: ChatMessage = {
          id: uid('msg'),
          projectId,
          role,
          content,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id !== projectId ? p : { ...p, chat: [...p.chat, msg], updatedAt: new Date().toISOString() }
          ),
        }));
      },

      recalcProgress: (projectId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const { progress, phaseStatuses } = computeProgress(p);
            const phases = p.phases.map((ph) => ({
              ...ph,
              status: (phaseStatuses.get(ph.id) as Project['phases'][number]['status']) || ph.status,
            }));
            const currentPhase = phases.find((ph) => ph.status === 'In Progress')?.title ||
              phases.find((ph) => ph.status === 'Not Started')?.title ||
              p.currentPhase;
            return {
              ...p,
              progress,
              phases,
              currentPhase,
              status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Planning',
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
    }),
    {
      name: 'psd-store',
      partialize: (state) => ({ projects: state.projects, theme: state.theme }),
    }
  )
);

export function getProjectStats(projects: Project[]) {
  const totalProjects = projects.length;
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = projects.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.status === 'Completed').length,
    0
  );
  const overallProgress =
    totalProjects > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / totalProjects)
      : 0;
  return { totalProjects, totalTasks, completedTasks, overallProgress };
}

export function getPhaseProgress(project: Project, phaseId: string) {
  const phaseTasks = project.tasks.filter((t) => t.phaseId === phaseId);
  if (phaseTasks.length === 0) return 0;
  const completed = phaseTasks.filter((t) => t.status === 'Completed').length;
  return Math.round((completed / phaseTasks.length) * 100);
}