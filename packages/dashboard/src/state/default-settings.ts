import type { DashboardSettings } from "../types";

export const defaultSettings: DashboardSettings = {
  profileName: "John-Henry",
  theme: "dark",
  accent: "red",
  backgroundMode: "gradient",
  backgroundColor: "#141414",
  backgroundGradient:
    "radial-gradient(circle at 18% 18%, rgba(239, 68, 68, 0.38), transparent 28%), linear-gradient(135deg, #161616 0%, #22272b 45%, #162821 100%)",
  dim: 38,
  blur: 0,
  editMode: false,
  widgetIcons: {
    enabled: true,
    hidden: {}
  }
};
