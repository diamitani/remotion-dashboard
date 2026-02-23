import type { User } from '../types/platform';

const USER_KEY = 'remotion_saas_user';

export const loadSessionUser = (): User | null => {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const saveSessionUser = (user: User): void => {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSessionUser = (): void => {
  window.localStorage.removeItem(USER_KEY);
};
