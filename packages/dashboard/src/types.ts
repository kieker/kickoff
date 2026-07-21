export type ThemeMode = "dark" | "light";
export type Accent = "red" | "cyan" | "green" | "gold" | "white";
export type BackgroundMode = "gradient" | "solid" | "image";
export type WidgetId = "youtube" | "steam" | "weather" | "reddit" | "spotify";

export type DashboardSettings = {
  profileName: string;
  theme: ThemeMode;
  accent: Accent;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  backgroundGradient: string;
  backgroundImage?: string;
  dim: number;
  blur: number;
  editMode: boolean;
  widgetIcons: {
    enabled: boolean;
    hidden: Partial<Record<WidgetId, boolean>>;
  };
};
