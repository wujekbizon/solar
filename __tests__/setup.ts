import { vi } from 'vitest';

// Mock localStorage for Zustand persist middleware
const storage = new Map<string, string>();

const localStorageMock = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
  clear: () => {
    storage.clear();
  },
  length: storage.size,
  key: (index: number) => Array.from(storage.keys())[index] || null,
};

global.localStorage = localStorageMock as Storage;
