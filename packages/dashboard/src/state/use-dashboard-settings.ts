import { useEffect, useMemo, useState } from "react";
import { browserStorage } from "@kickoff/platform";
import { defaultSettings } from "./default-settings";
import type { Accent, DashboardSettings } from "../types";

const storageKey = "kickoff.dashboard.settings";

const accents: Record<Accent, string> = {
  red: "2 72% 54%",
  cyan: "188 77% 44%",
  green: "143 61% 42%",
  gold: "42 87% 55%"
};

export function useDashboardSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(() =>
    browserStorage.get(storageKey, defaultSettings)
  );

  useEffect(() => {
    browserStorage.set(storageKey, settings);
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
    root.style.setProperty("--accent", accents[settings.accent]);
  }, [settings.accent, settings.theme]);

  const actions = useMemo(
    () => ({
      update(next: Partial<DashboardSettings>) {
        setSettings((current) => ({ ...current, ...next }));
      },
      reset() {
        setSettings(defaultSettings);
      }
    }),
    []
  );

  return { settings, actions };
}
