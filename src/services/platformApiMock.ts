import type { ChatRequest, ChatResponse, CreateProjectInput, LoginInput, Project, User } from '../types/platform';
import type { PlatformApi } from './platformApi';

const STORAGE_KEY = 'remotion_saas_projects';

const wait = (ms: number) => new Promise((resolve) => {
  window.setTimeout(resolve, ms);
});

const now = () => new Date().toISOString();

const createId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

const getStoredProjects = (): Project[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
};

const saveStoredProjects = (projects: Project[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

const createStarterProject = (workspaceId: string): Project => ({
  id: createId('proj'),
  workspaceId,
  name: 'Launch Campaign Reel',
  description: 'Brand intro sequence for first campaign.',
  createdAt: now(),
  updatedAt: now(),
  tokenMode: 'platform-managed',
  openCodeProjectRef: createId('ocp'),
  remotionTemplate: 'brand-dashboard-v1',
  previewPrompt: 'Cinematic launch reel with data-driven overlays',
  messages: [
    {
      id: createId('msg'),
      role: 'system',
      text: 'Workspace initialized. Base Remotion stack and design tokens are loaded.',
      createdAt: now(),
    },
    {
      id: createId('msg'),
      role: 'assistant',
      text: 'Ready to edit. Send a prompt to patch scene structure, timing, and style.',
      createdAt: now(),
    },
  ],
});

const upsertProject = (project: Project): Project => {
  const projects = getStoredProjects();
  const index = projects.findIndex((item) => item.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.unshift(project);
  }
  saveStoredProjects(projects);
  return project;
};

export const createMockPlatformApi = (): PlatformApi => ({
  async login(input: LoginInput): Promise<User> {
    await wait(350);

    const name = input.email.split('@')[0] ?? 'creator';
    return {
      id: `usr_${name.toLowerCase()}`,
      email: input.email,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
    };
  },

  async listProjects(workspaceId: string): Promise<Project[]> {
    await wait(220);

    let projects = getStoredProjects().filter((project) => project.workspaceId === workspaceId);
    if (projects.length === 0) {
      const starter = createStarterProject(workspaceId);
      upsertProject(starter);
      projects = [starter];
    }

    return projects.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    await wait(260);

    const project: Project = {
      id: createId('proj'),
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description,
      createdAt: now(),
      updatedAt: now(),
      tokenMode: 'platform-managed',
      openCodeProjectRef: createId('ocp'),
      remotionTemplate: 'brand-dashboard-v1',
      previewPrompt: input.description || 'New project preview scene',
      messages: [
        {
          id: createId('msg'),
          role: 'system',
          text: 'Project created. Prompt the assistant to build your first scene set.',
          createdAt: now(),
        },
      ],
    };

    return upsertProject(project);
  },

  async sendPrompt(request: ChatRequest): Promise<ChatResponse> {
    await wait(700);

    const projects = getStoredProjects();
    const project = projects.find((item) => item.id === request.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const userMessage = {
      id: createId('msg'),
      role: 'user' as const,
      text: request.prompt,
      createdAt: now(),
    };

    const assistantMessage = {
      id: createId('msg'),
      role: 'assistant' as const,
      text: `Patch planned for ${project.remotionTemplate}. Updated typography rhythm, scene pacing, and chart animation timing from your prompt.`,
      createdAt: now(),
    };

    const updatedProject: Project = {
      ...project,
      updatedAt: now(),
      previewPrompt: request.prompt,
      messages: [...project.messages, userMessage, assistantMessage],
    };

    upsertProject(updatedProject);

    return {
      project: updatedProject,
      assistantMessage,
    };
  },

  async updateTokenMode(projectId, mode) {
    await wait(180);

    const projects = getStoredProjects();
    const project = projects.find((item) => item.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const updatedProject: Project = {
      ...project,
      tokenMode: mode,
      updatedAt: now(),
    };

    return upsertProject(updatedProject);
  },
});
