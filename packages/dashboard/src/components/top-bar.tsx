import { Bell, LayoutGrid, RefreshCw, Settings } from "lucide-react";
import { Button } from "@kickoff/ui";
import type { DashboardSettings } from "../types";

type TopBarProps = {
  settings: DashboardSettings;
  onToggleEditMode(): void;
};

export function TopBar({ settings, onToggleEditMode }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-black/10 bg-white/58 px-5 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/18">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
          K
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Kickoff</p>
          <p className="truncate text-xs text-muted-foreground">
            {settings.profileName}'s media dashboard
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button aria-label="Refresh dashboard" size="icon" variant="ghost">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button aria-label="Notifications" size="icon" variant="ghost">
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Toggle layout editing"
          size="icon"
          variant={settings.editMode ? "primary" : "ghost"}
          onClick={onToggleEditMode}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button aria-label="Settings" size="icon" variant="ghost">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
