import type { ChatRequest, ChatResponse, CreateProjectInput, LoginInput, Project, User } from '../types/platform';
import { createMockPlatformApi } from './platformApiMock';

export type PlatformApi = {
  login: (input: LoginInput) => Promise<User>;
  listProjects: (workspaceId: string) => Promise<Project[]>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  sendPrompt: (request: ChatRequest) => Promise<ChatResponse>;
  updateTokenMode: (projectId: string, mode: Project['tokenMode']) => Promise<Project>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

const createRemotePlatformApi = (baseUrl: string): PlatformApi => {
  const call = async <T>(path: string, method: string, body?: object): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  };

  return {
    login: (input) => call<User>('/auth/login', 'POST', input),
    listProjects: (workspaceId) => call<Project[]>(`/workspaces/${workspaceId}/projects`, 'GET'),
    createProject: (input) => call<Project>('/projects', 'POST', input),
    sendPrompt: (request) => call<ChatResponse>('/chat', 'POST', request),
    updateTokenMode: (projectId, mode) => call<Project>(`/projects/${projectId}/token-mode`, 'PATCH', { mode }),
  };
};

export const createPlatformApi = (): PlatformApi => {
  if (!API_BASE_URL) {
    return createMockPlatformApi();
  }

  return createRemotePlatformApi(API_BASE_URL);
};
