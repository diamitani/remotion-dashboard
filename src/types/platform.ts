export type MessageRole = 'user' | 'assistant' | 'system';

export type TokenMode = 'platform-managed' | 'bring-your-own-key';

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
};
