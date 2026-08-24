import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project,
  Task,
  TechItem,
  TechCategory,
  ArchNodeData,
  ChatMessage,
  TaskStatus,
} from './types';
import {
  SAMPLE_PROJECTS,
  generateProject,
  findTech,
  uid,
} from './mock-data';

interface AppState {
  projects: Project[];
  theme: 'dark' | 'light';

  createProject: (opts: {
    name: string;
    description: string;
    type: string;
    experienceLevel: Project['experienceLevel'];
    mode: 'ai' | 'manual';
    selectedTech?: { category: TechCategory; technology: string }[];
  }) => string;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;

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

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: SAMPLE_PROJECTS,
      theme: 'dark',

      createProject: (opts) => {
        const project = generateProject(opts);
        set((state) => ({ projects: [...state.projects, project] }));
        return project.id;
      },

      deleteProject: (id) => {
        set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
      },

      getProject: (id) => get().projects.find((p) => p.id === id),

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
            const tech = p.techStack.find((t) => t.id === techId);
            if (!tech) return p;
            const newTech = findTech(tech.category, newTechnology);
            if (!newTech) return p;
            return {
              ...p,
              techStack: p.techStack.map((t) => (t.id === techId ? newTech : t)),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      addTech: (projectId, category, technology) => {
        const newTech = findTech(category, technology);
        if (!newTech) return;
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id !== projectId ? p : { ...p, techStack: [...p.techStack, newTech], updatedAt: new Date().toISOString() }
          ),
        }));
      },

      removeTech: (projectId, techId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id !== projectId ? p : { ...p, techStack: p.techStack.filter((t) => t.id !== techId), updatedAt: new Date().toISOString() }
          ),
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
      partialize: (state) => ({ projects: state.projects }),
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
