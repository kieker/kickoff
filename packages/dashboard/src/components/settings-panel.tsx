import { ImagePlus, RotateCcw } from "lucide-react";
import { Button, Slider, Toggle } from "@kickoff/ui";
import type { Accent, DashboardSettings, ThemeMode } from "../types";

type SettingsPanelProps = {
  settings: DashboardSettings;
  onChange(next: Partial<DashboardSettings>): void;
  onReset(): void;
};

const accentOptions: Accent[] = ["red", "cyan", "green", "gold"];
const themeOptions: ThemeMode[] = ["dark", "light"];

export function SettingsPanel({ settings, onChange, onReset }: SettingsPanelProps) {
  function handleImageUpload(file?: File) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange({
          backgroundMode: "image",
          backgroundImage: reader.result
        });
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <aside className="flex min-h-0 flex-col gap-5 border-l border-black/10 bg-white/62 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/20 xl:sticky xl:top-[65px] xl:max-h-[calc(100vh-65px)] xl:overflow-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Workspace</h2>
          <p className="text-xs text-muted-foreground">Appearance and beta controls</p>
        </div>
        <Button aria-label="Reset appearance" size="icon" variant="ghost" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Theme</p>
        <div className="grid grid-cols-2 gap-2">
          {themeOptions.map((theme) => (
            <Toggle
              key={theme}
              pressed={settings.theme === theme}
              onClick={() => onChange({ theme })}
            >
              {theme}
            </Toggle>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Accent</p>
        <div className="grid grid-cols-4 gap-2">
          {accentOptions.map((accent) => (
            <button
              key={accent}
              type="button"
              aria-label={`Use ${accent} accent`}
              className="h-9 rounded-md border border-black/10 dark:border-white/10"
              style={{
                background:
                  accent === "red"
                    ? "#dc2626"
                    : accent === "cyan"
                      ? "#0891b2"
                      : accent === "green"
                        ? "#16a34a"
                        : "#ca8a04",
                outline: settings.accent === accent ? "2px solid white" : "none"
              }}
              onClick={() => onChange({ accent })}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Background</p>
        <div className="grid grid-cols-2 gap-2">
          <Toggle
            pressed={settings.backgroundMode === "gradient"}
            onClick={() => onChange({ backgroundMode: "gradient" })}
          >
            gradient
          </Toggle>
          <Toggle
            pressed={settings.backgroundMode === "solid"}
            onClick={() => onChange({ backgroundMode: "solid" })}
          >
            solid
          </Toggle>
        </div>

        <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-black/20 bg-black/6 text-xs font-medium text-muted-foreground transition hover:bg-black/10 hover:text-foreground dark:border-white/20 dark:bg-white/8 dark:hover:bg-white/12">
          <ImagePlus className="h-4 w-4" />
          local image
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={(event) => handleImageUpload(event.target.files?.[0])}
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Dim</span>
          <span>{settings.dim}%</span>
        </div>
        <Slider
          min={0}
          max={70}
          value={settings.dim}
          onChange={(event) => onChange({ dim: Number(event.currentTarget.value) })}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Blur</span>
          <span>{settings.blur}px</span>
        </div>
        <Slider
          min={0}
          max={16}
          value={settings.blur}
          onChange={(event) => onChange({ blur: Number(event.currentTarget.value) })}
        />
      </div>
    </aside>
  );
}
