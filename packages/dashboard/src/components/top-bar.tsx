import { Bell, LayoutGrid, RefreshCw, Settings } from "lucide-react";
import { Button } from "@kickoff/ui";
import type { DashboardSettings } from "../types";

type TopBarProps = {
  settings: DashboardSettings;
  lastRefreshedAt?: string;
  notificationsOpen: boolean;
  settingsOpen: boolean;
  onToggleEditMode(): void;
  onRefresh(): void;
  onToggleNotifications(): void;
  onToggleSettings(): void;
};

export function TopBar({
  settings,
  lastRefreshedAt,
  notificationsOpen,
  settingsOpen,
  onToggleEditMode,
  onRefresh,
  onToggleNotifications,
  onToggleSettings
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-black/10 bg-white/58 px-5 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/18">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
          style={{
            background:
              settings.theme === "dark"
                ? "linear-gradient(135deg, hsl(var(--accent)) 0%, color-mix(in srgb, hsl(var(--accent)) 28%, #080b12) 100%)"
                : "linear-gradient(135deg, hsl(var(--accent)) 0%, color-mix(in srgb, hsl(var(--accent)) 42%, #f8fafc) 100%)",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.45)"
          }}
        >
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
        {lastRefreshedAt ? (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Updated {lastRefreshedAt}
          </span>
        ) : null}
        <Button aria-label="Refresh dashboard" size="icon" variant="ghost" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <div className="relative">
        <Button
          aria-label="Notifications"
          size="icon"
          variant={notificationsOpen ? "primary" : "ghost"}
          onClick={onToggleNotifications}
        >
          <Bell className="h-4 w-4" />
        </Button>
        {notificationsOpen ? (
          <div className="absolute right-0 top-11 w-72 rounded-lg border border-black/10 bg-card/96 p-3 text-sm shadow-panel dark:border-white/12">
            <p className="font-semibold">Beta notifications</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Real notification settings will arrive after the first live integrations.
            </p>
          </div>
        ) : null}
        </div>
        <Button
          aria-label="Toggle layout editing"
          size="icon"
          variant={settings.editMode ? "primary" : "ghost"}
          onClick={onToggleEditMode}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          aria-label={settingsOpen ? "Hide settings" : "Show settings"}
          size="icon"
          variant={settingsOpen ? "primary" : "ghost"}
          onClick={onToggleSettings}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
