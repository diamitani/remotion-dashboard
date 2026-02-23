import type { BillingPlan } from '../types/platform';

export const PLAN_INITIAL_CREDITS: Record<BillingPlan, number> = {
  starter: 300,
  pro: 1500,
  studio: 6000,
};

export const estimatePromptCreditCost = (prompt: string): number => {
  const normalizedLength = prompt.trim().length;
  return Math.max(12, Math.ceil(normalizedLength / 7));
};
