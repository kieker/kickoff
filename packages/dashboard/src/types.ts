export type ThemeMode = "dark" | "light";
export type Accent = "red" | "cyan" | "green" | "gold";
export type BackgroundMode = "gradient" | "solid" | "image";

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
};
