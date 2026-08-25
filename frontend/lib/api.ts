import { useAuth } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuth.getState().token;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const projectApi = {
  create: (data: { name: string; description: string; type?: string; experienceLevel?: string }) =>
    fetchWithAuth<{ success: boolean; project: any }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () =>
    fetchWithAuth<{ success: boolean; projects: any[] }>('/api/projects'),

  getOne: (id: string) =>
    fetchWithAuth<{ success: boolean; project: any }>(`/api/projects/${id}`),

  update: (id: string, data: Partial<{ name: string; description: string; type: string; experienceLevel: string; status: string }>) =>
    fetchWithAuth<{ success: boolean; project: any }>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchWithAuth<{ success: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE',
    }),
};

export const analysisApi = {
  generate: (projectId: string) =>
    fetchWithAuth<{ success: boolean; analysis: any }>(`/api/projects/${projectId}/analysis/generate`, {
      method: 'POST',
    }),

  get: (projectId: string) =>
    fetchWithAuth<{ success: boolean; analysis: any }>(`/api/projects/${projectId}/analysis`),
};

export const techStackApi = {
  generate: (projectId: string) =>
    fetchWithAuth<{ success: boolean; techStack: any }>(`/api/projects/${projectId}/tech-stack/generate`, {
      method: 'POST',
    }),

  get: (projectId: string) =>
    fetchWithAuth<{ success: boolean; techStack: any }>(`/api/projects/${projectId}/tech-stack`),

  update: (projectId: string, data: { frontend?: any[]; backend?: any[]; database?: any[]; authentication?: any[]; otherServices?: any[] }) =>
    fetchWithAuth<{ success: boolean; techStack: any }>(`/api/projects/${projectId}/tech-stack`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    fetchWithAuth<{ success: boolean; token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchWithAuth<{ success: boolean; token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () =>
    fetchWithAuth<{ success: boolean; user: any }>('/api/auth/me'),
};

export const roadmapApi = {
  generate: (projectId: string) =>
    fetchWithAuth<{ success: boolean; roadmap: any }>(`/api/projects/${projectId}/roadmap/generate`, {
      method: 'POST',
    }),

  get: (projectId: string) =>
    fetchWithAuth<{ success: boolean; roadmap: any }>(`/api/projects/${projectId}/roadmap`),

  updateTaskStatus: (projectId: string, phaseIndex: number, taskIndex: number, status: string) =>
    fetchWithAuth<{ success: boolean; roadmap: any }>(`/api/projects/${projectId}/roadmap/tasks/${phaseIndex}/${taskIndex}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const architectureApi = {
  generate: (projectId: string) =>
    fetchWithAuth<{ success: boolean; architecture: any }>(`/api/projects/${projectId}/architecture/generate`, {
      method: 'POST',
    }),

  get: (projectId: string) =>
    fetchWithAuth<{ success: boolean; architecture: any }>(`/api/projects/${projectId}/architecture`),

  update: (projectId: string, data: { nodes?: any[]; edges?: any[] }) =>
    fetchWithAuth<{ success: boolean; architecture: any }>(`/api/projects/${projectId}/architecture`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const healthApi = {
  check: () =>
    fetch(`${API_URL}/api/health`).then((res) => res.json()),
};