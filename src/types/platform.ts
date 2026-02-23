export type MessageRole = 'user' | 'assistant' | 'system';

export type TokenMode = 'platform-managed' | 'bring-your-own-key';
export type BillingPlan = 'starter' | 'pro' | 'studio';
export type SubscriptionStatus = 'active' | 'paused' | 'canceled';
export type ByokProvider = 'openai' | 'anthropic' | 'other';

export type User = {
  id: string;
  email: string;
  displayName: string;
};

export type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: string;
};

export type Project = {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  tokenMode: TokenMode;
  openCodeProjectRef: string;
  remotionTemplate: string;
  previewPrompt: string;
  messages: ChatMessage[];
};

export type LoginInput = {
  email: string;
  password: string;
};

export type CreateProjectInput = {
  workspaceId: string;
  name: string;
  description: string;
};

export type ChatRequest = {
  projectId: string;
  prompt: string;
};

export type ChatResponse = {
  project: Project;
  assistantMessage: ChatMessage;
  billing: BillingProfile;
  promptCreditCost: number;
};

export type BillingProfile = {
  workspaceId: string;
  plan: BillingPlan;
  subscriptionStatus: SubscriptionStatus;
  paymentMethodAttached: boolean;
  creditBalance: number;
  autoTopUpEnabled: boolean;
  autoTopUpThreshold: number;
  autoTopUpAmount: number;
  byokConnected: boolean;
  byokProvider: ByokProvider | null;
  byokMaskedKey: string | null;
  lastAutoTopUpAt: string | null;
};

export type UpdateBillingInput = {
  workspaceId: string;
  plan?: BillingPlan;
  subscriptionStatus?: SubscriptionStatus;
  paymentMethodAttached?: boolean;
  autoTopUpEnabled?: boolean;
  autoTopUpThreshold?: number;
  autoTopUpAmount?: number;
};

export type ConnectByokInput = {
  workspaceId: string;
  provider: ByokProvider;
  apiKey: string;
};
