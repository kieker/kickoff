import { ImagePlus, RotateCcw, X } from "lucide-react";
import { Button, cn, Slider, Toggle } from "@kickoff/ui";
import type { Accent, DashboardSettings, ThemeMode } from "../types";

type SettingsPanelProps = {
  id?: string;
  open: boolean;
  settings: DashboardSettings;
  onChange(next: Partial<DashboardSettings>): void;
  onReset(): void;
  onClose(): void;
};

const accentOptions: Accent[] = ["red", "cyan", "green", "gold"];
const themeOptions: ThemeMode[] = ["dark", "light"];

export function SettingsPanel({
  id,
  open,
  settings,
  onChange,
  onReset,
  onClose
}: SettingsPanelProps) {
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
    <>
      <button
        type="button"
        aria-label="Close settings backdrop"
        className={cn(
          "fixed inset-0 z-30 bg-black/36 backdrop-blur-sm transition-opacity xl:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        id={id}
        aria-hidden={!open}
        className={cn(
          "fixed right-0 top-[65px] z-40 flex h-[calc(100vh-65px)] w-[min(360px,calc(100vw-24px))] flex-col gap-5 overflow-auto border-l border-black/10 bg-white/82 p-4 shadow-panel backdrop-blur-xl transition-transform duration-300 ease-out dark:border-white/10 dark:bg-black/72",
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Workspace</h2>
            <p className="text-xs text-muted-foreground">Appearance and beta controls</p>
          </div>
          <div className="flex gap-2">
            <Button aria-label="Reset appearance" size="icon" variant="ghost" onClick={onReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button aria-label="Close settings" size="icon" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
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
    </>
  );
}
