import { useEffect, useMemo, useState } from "react";
import { browserStorage } from "@kickoff/platform";
import { defaultSettings } from "./default-settings";
import type { Accent, DashboardSettings } from "../types";

const storageKey = "kickoff.dashboard.settings";

const accents: Record<Accent, string> = {
  red: "2 72% 54%",
  cyan: "188 77% 44%",
  green: "143 61% 42%",
  gold: "42 87% 55%",
  white: "0 0% 100%"
};

const accentForegrounds: Record<Accent, string> = {
  red: "0 0% 100%",
  cyan: "0 0% 100%",
  green: "0 0% 100%",
  gold: "230 14% 12%",
  white: "230 14% 12%"
};

export function useDashboardSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(() =>
    mergeSettings(browserStorage.get(storageKey, defaultSettings))
  );

  useEffect(() => {
    browserStorage.set(storageKey, settings);
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
    root.style.setProperty("--accent", accents[settings.accent]);
    root.style.setProperty("--accent-foreground", accentForegrounds[settings.accent]);
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

function mergeSettings(settings: DashboardSettings): DashboardSettings {
  return {
    ...defaultSettings,
    ...settings,
    widgetIcons: {
      ...defaultSettings.widgetIcons,
      ...settings.widgetIcons,
      hidden: {
        ...defaultSettings.widgetIcons.hidden,
        ...settings.widgetIcons?.hidden
      }
    }
  };
}
