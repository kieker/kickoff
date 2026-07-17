import { Check, Gamepad2, Music2, Newspaper, PlaySquare, Plus, X } from "lucide-react";
import { Button } from "@kickoff/ui";
import type { WidgetId } from "../state/use-dashboard-interactions";

type WidgetLibraryProps = {
  open: boolean;
  visibleWidgets: WidgetId[];
  onToggle(widgetId: WidgetId): void;
  onClose(): void;
};

const widgets: Array<{
  id: WidgetId;
  title: string;
  description: string;
  icon: typeof PlaySquare;
}> = [
  {
    id: "youtube",
    title: "YouTube queue",
    description: "Priority videos, saved clips, and local watch state.",
    icon: PlaySquare
  },
  {
    id: "steam",
    title: "Steam",
    description: "Profile snapshot and recently played games.",
    icon: Gamepad2
  },
  {
    id: "weather",
    title: "Weather",
    description: "Daily context before real Open-Meteo wiring.",
    icon: Newspaper
  },
  {
    id: "reddit",
    title: "Reddit",
    description: "Community posts with local hot, new, and top filters.",
    icon: Newspaper
  },
  {
    id: "spotify",
    title: "Now playing",
    description: "Phase-two Spotify placeholder widget.",
    icon: Music2
  }
];

export function WidgetLibrary({
  open,
  visibleWidgets,
  onToggle,
  onClose
}: WidgetLibraryProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="ml-auto flex h-full max-w-md flex-col rounded-lg border border-black/10 bg-card/95 text-card-foreground shadow-panel dark:border-white/12">
        <div className="flex items-start justify-between gap-4 border-b border-black/10 p-4 dark:border-white/10">
          <div>
            <h2 className="text-base font-semibold">Widget library</h2>
            <p className="text-sm text-muted-foreground">Choose what appears on the dashboard.</p>
          </div>
          <Button aria-label="Close widget library" size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
          {widgets.map((widget) => {
            const Icon = widget.icon;
            const isVisible = visibleWidgets.includes(widget.id);
            return (
              <button
                key={widget.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-md border border-black/10 bg-white/48 p-3 text-left transition hover:bg-white/72 dark:border-white/10 dark:bg-black/16 dark:hover:bg-white/10"
                onClick={() => onToggle(widget.id)}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent/18 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{widget.title}</span>
                  <span className="block text-xs text-muted-foreground">{widget.description}</span>
                </span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-black/6 dark:bg-white/8">
                  {isVisible ? <Check className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
