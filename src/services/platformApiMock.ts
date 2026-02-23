import type {
  BillingProfile,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ConnectByokInput,
  CreateProjectInput,
  LoginInput,
  Project,
  UpdateBillingInput,
  User,
} from '../types/platform';
import { PLAN_INITIAL_CREDITS, estimatePromptCreditCost } from '../utils/billing';
import type { PlatformApi } from './platformApi';

const PROJECT_STORAGE_KEY = 'remotion_saas_projects';
const BILLING_STORAGE_KEY = 'remotion_saas_billing';

const wait = (ms: number) => new Promise((resolve) => {
  window.setTimeout(resolve, ms);
});

const now = () => new Date().toISOString();

const createId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

const getStoredProjects = (): Project[] => {
  try {
    const raw = window.localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
};

const saveStoredProjects = (projects: Project[]) => {
  window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
};

const getStoredBillingProfiles = (): BillingProfile[] => {
  try {
    const raw = window.localStorage.getItem(BILLING_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as BillingProfile[];
  } catch {
    return [];
  }
};

const saveStoredBillingProfiles = (profiles: BillingProfile[]) => {
  window.localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(profiles));
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

const createStarterBillingProfile = (workspaceId: string): BillingProfile => ({
  workspaceId,
  plan: 'pro',
  subscriptionStatus: 'active',
  paymentMethodAttached: true,
  creditBalance: PLAN_INITIAL_CREDITS.pro,
  autoTopUpEnabled: true,
  autoTopUpThreshold: 150,
  autoTopUpAmount: 600,
  byokConnected: false,
  byokProvider: null,
  byokMaskedKey: null,
  lastAutoTopUpAt: null,
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

const upsertBillingProfile = (profile: BillingProfile): BillingProfile => {
  const profiles = getStoredBillingProfiles();
  const index = profiles.findIndex((item) => item.workspaceId === profile.workspaceId);
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.unshift(profile);
  }
  saveStoredBillingProfiles(profiles);
  return profile;
};

const ensureBillingProfile = (workspaceId: string): BillingProfile => {
  const existing = getStoredBillingProfiles().find((item) => item.workspaceId === workspaceId);
  if (existing) {
    return existing;
  }
  return upsertBillingProfile(createStarterBillingProfile(workspaceId));
};

const maskApiKey = (apiKey: string): string => {
  const trimmed = apiKey.trim();
  if (trimmed.length <= 8) {
    return `${trimmed.slice(0, 2)}••••`;
  }
  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`;
};

const createSystemMessage = (text: string): ChatMessage => ({
  id: createId('msg'),
  role: 'system',
  text,
  createdAt: now(),
});

const applyAutoTopUp = (
  billing: BillingProfile,
  requiredCredits: number,
): { billing: BillingProfile; topUpCredits: number } => {
  if (
    !billing.autoTopUpEnabled
    || billing.subscriptionStatus !== 'active'
    || !billing.paymentMethodAttached
    || billing.autoTopUpAmount <= 0
    || billing.creditBalance >= requiredCredits
  ) {
    return { billing, topUpCredits: 0 };
  }

  let updated = { ...billing };
  let topUpCredits = 0;
  let safetyCounter = 0;

  while (updated.creditBalance < requiredCredits && safetyCounter < 10) {
    updated = {
      ...updated,
      creditBalance: updated.creditBalance + updated.autoTopUpAmount,
      lastAutoTopUpAt: now(),
    };
    topUpCredits += updated.autoTopUpAmount;
    safetyCounter += 1;
  }

  return { billing: updated, topUpCredits };
};

const applyBillingUpdate = (billing: BillingProfile, input: UpdateBillingInput): BillingProfile => {
  const next: BillingProfile = {
    ...billing,
    ...(input.plan ? { plan: input.plan } : {}),
    ...(input.subscriptionStatus ? { subscriptionStatus: input.subscriptionStatus } : {}),
    ...(typeof input.paymentMethodAttached === 'boolean' ? { paymentMethodAttached: input.paymentMethodAttached } : {}),
    ...(typeof input.autoTopUpEnabled === 'boolean' ? { autoTopUpEnabled: input.autoTopUpEnabled } : {}),
    ...(typeof input.autoTopUpThreshold === 'number' ? { autoTopUpThreshold: input.autoTopUpThreshold } : {}),
    ...(typeof input.autoTopUpAmount === 'number' ? { autoTopUpAmount: input.autoTopUpAmount } : {}),
  };

  if (next.autoTopUpThreshold < 1 || next.autoTopUpAmount < 1) {
    throw new Error('Auto top-up threshold and amount must be at least 1 credit.');
  }

  const planUpdated = input.plan && input.plan !== billing.plan;
  const activated = input.subscriptionStatus === 'active' && billing.subscriptionStatus !== 'active';
  if ((planUpdated || activated) && next.subscriptionStatus === 'active') {
    next.creditBalance = Math.max(next.creditBalance, PLAN_INITIAL_CREDITS[next.plan]);
  }

  return next;
};

const createAssistantMessage = (project: Project): ChatMessage => ({
  id: createId('msg'),
  role: 'assistant',
  text: `Patch planned for ${project.remotionTemplate}. Updated typography rhythm, scene pacing, and chart animation timing from your prompt.`,
  createdAt: now(),
});

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

    ensureBillingProfile(workspaceId);

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

    ensureBillingProfile(input.workspaceId);

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

    let billing = ensureBillingProfile(project.workspaceId);
    const promptCreditCost = project.tokenMode === 'platform-managed' ? estimatePromptCreditCost(request.prompt) : 0;

    const userMessage: ChatMessage = {
      id: createId('msg'),
      role: 'user',
      text: request.prompt,
      createdAt: now(),
    };

    const systemMessages: ChatMessage[] = [];
    if (project.tokenMode === 'platform-managed') {
      if (billing.creditBalance < Math.max(promptCreditCost, billing.autoTopUpThreshold)) {
        const autoTopUpResult = applyAutoTopUp(billing, promptCreditCost);
        billing = autoTopUpResult.billing;
        if (autoTopUpResult.topUpCredits > 0) {
          systemMessages.push(
            createSystemMessage(`Auto top-up purchased ${autoTopUpResult.topUpCredits} credits from your saved subscription payment method.`),
          );
        }
      }

      if (billing.creditBalance < promptCreditCost) {
        throw new Error(
          `Insufficient platform credits (${billing.creditBalance} available, ${promptCreditCost} required). Attach payment + active subscription or switch to BYOK.`,
        );
      }

      billing = {
        ...billing,
        creditBalance: Math.max(0, billing.creditBalance - promptCreditCost),
      };

      systemMessages.push(
        createSystemMessage(`Platform-managed tokens used ${promptCreditCost} credits. Remaining balance: ${billing.creditBalance}.`),
      );
    } else {
      if (!billing.byokConnected) {
        throw new Error('BYOK mode is enabled but no API key is connected for this workspace.');
      }

      systemMessages.push(createSystemMessage(`BYOK mode active (${billing.byokProvider}). Workspace credits were not charged.`));
    }

    billing = upsertBillingProfile(billing);
    const assistantMessage = createAssistantMessage(project);

    const updatedProject: Project = {
      ...project,
      updatedAt: now(),
      previewPrompt: request.prompt,
      messages: [...project.messages, userMessage, ...systemMessages, assistantMessage],
    };

    upsertProject(updatedProject);

    return {
      project: updatedProject,
      assistantMessage,
      billing,
      promptCreditCost,
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

  async getBillingProfile(workspaceId: string): Promise<BillingProfile> {
    await wait(140);
    return ensureBillingProfile(workspaceId);
  },

  async updateBillingProfile(input: UpdateBillingInput): Promise<BillingProfile> {
    await wait(180);

    const current = ensureBillingProfile(input.workspaceId);
    const updated = applyBillingUpdate(current, input);
    return upsertBillingProfile(updated);
  },

  async connectByok(input: ConnectByokInput): Promise<BillingProfile> {
    await wait(220);

    if (input.apiKey.trim().length < 10) {
      throw new Error('API key looks too short. Paste a valid provider token.');
    }

    const current = ensureBillingProfile(input.workspaceId);
    const updated: BillingProfile = {
      ...current,
      byokConnected: true,
      byokProvider: input.provider,
      byokMaskedKey: maskApiKey(input.apiKey),
    };

    return upsertBillingProfile(updated);
  },

  async disconnectByok(workspaceId: string): Promise<BillingProfile> {
    await wait(180);

    const current = ensureBillingProfile(workspaceId);
    const updated: BillingProfile = {
      ...current,
      byokConnected: false,
      byokProvider: null,
      byokMaskedKey: null,
    };

    return upsertBillingProfile(updated);
  },
});
