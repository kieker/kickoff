export type StorageAdapter = {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
};

export const browserStorage: StorageAdapter = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") {
      return fallback;
    }

    const value = window.localStorage.getItem(key);
    if (!value) {
      return fallback;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(key);
  }
};

export function openExternal(url: string) {
  const shell = window.kickoff?.shell;
  if (shell) {
    shell.openExternal(url);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

declare global {
  interface Window {
    kickoff?: {
      shell: {
        openExternal(url: string): void;
      };
    };
  }
}
