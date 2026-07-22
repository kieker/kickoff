import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@kickoff/ui";
import { CommandPalette } from "./components/command-palette";
import { SettingsPanel } from "./components/settings-panel";
import { TopBar } from "./components/top-bar";
import { WidgetLibrary } from "./components/widget-library";
import { useDashboardInteractions } from "./state/use-dashboard-interactions";
import { useDashboardSettings } from "./state/use-dashboard-settings";
import { useYouTubeConnection } from "./state/use-youtube-connection";
import type { WidgetId } from "./types";
import { RedditWidget } from "./widgets/reddit-widget";
import { SpotifyWidget } from "./widgets/spotify-widget";
import { SteamWidget } from "./widgets/steam-widget";
import { WeatherWidget } from "./widgets/weather-widget";
import { YouTubeHub } from "./widgets/youtube-hub";

export function KickoffDashboard() {
  const { settings, actions } = useDashboardSettings();
  const { state: interactions, actions: interactionActions } = useDashboardInteractions();
  const { connectionState: youtubeConnection, actions: youtubeActions } = useYouTubeConnection();
  const [widgetLibraryOpen, setWidgetLibraryOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const backgroundStyle = getBackgroundStyle(settings);
  const visibleWidgets = new Set(interactions.visibleWidgets);

  function openWidgetLibrary() {
    setCommandPaletteOpen(false);
    setWidgetLibraryOpen(true);
  }

  function showWidgetIcon(widgetId: WidgetId) {
    return settings.widgetIcons.enabled && !settings.widgetIcons.hidden[widgetId];
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          ...backgroundStyle,
          filter: `blur(${settings.blur}px)`,
          transform: settings.blur > 0 ? "scale(1.04)" : undefined
        }}
      />
      <div
        className={settings.theme === "dark" ? "fixed inset-0 bg-black" : "fixed inset-0 bg-white"}
        style={{
          opacity:
            settings.theme === "dark"
              ? settings.dim / 100
              : Math.min(settings.dim / 160, 0.36)
        }}
      />

      <div className="relative min-h-screen">
        <TopBar
          settings={settings}
          lastRefreshedAt={interactions.lastRefreshedAt}
          notificationsOpen={notificationsOpen}
          settingsOpen={settingsOpen}
          onToggleEditMode={() => actions.update({ editMode: !settings.editMode })}
          onRefresh={interactionActions.refresh}
          onToggleNotifications={() => setNotificationsOpen((open) => !open)}
          onToggleSettings={() => setSettingsOpen((open) => !open)}
        />

        <main className="grid grid-cols-1 items-start">
          <section className="min-w-0 p-4 lg:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-normal">Today in media</h1>
                <p className="text-sm text-muted-foreground">
                  YouTube first, with games and communities close by.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setCommandPaletteOpen(true)}>
                  <Search className="h-4 w-4" />
                  Find
                </Button>
                <Button variant="primary" onClick={openWidgetLibrary}>
                  <Plus className="h-4 w-4" />
                  Add widget
                </Button>
              </div>
            </div>

            {settings.editMode ? (
              <div className="mb-4 rounded-md border border-dashed border-accent bg-accent/12 px-4 py-3 text-sm">
                Layout edit mode is on. Drag and resize controls come next.
              </div>
            ) : null}

            {interactions.visibleWidgets.length > 0 ? (
              <div className="grid auto-rows-min grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {visibleWidgets.has("youtube") ? (
                  <YouTubeHub
                    videoStatuses={interactions.videoStatuses}
                    onSetVideoStatus={interactionActions.setVideoStatus}
                    connectionState={youtubeConnection}
                    onConnect={youtubeActions.connect}
                    onDisconnect={youtubeActions.disconnect}
                    showIcon={showWidgetIcon("youtube")}
                    onRefresh={interactionActions.refresh}
                    onHide={() => interactionActions.toggleWidget("youtube")}
                  />
                ) : null}
                {visibleWidgets.has("steam") ? (
                  <SteamWidget
                    showIcon={showWidgetIcon("steam")}
                    onRefresh={interactionActions.refresh}
                    onHide={() => interactionActions.toggleWidget("steam")}
                  />
                ) : null}
                {visibleWidgets.has("weather") ? (
                  <WeatherWidget
                    location={interactions.weatherLocation}
                    showIcon={showWidgetIcon("weather")}
                    onLocationChange={interactionActions.setWeatherLocation}
                    onRefresh={interactionActions.refresh}
                    onHide={() => interactionActions.toggleWidget("weather")}
                  />
                ) : null}
                {visibleWidgets.has("reddit") ? (
                  <RedditWidget
                    filter={interactions.redditFilter}
                    showIcon={showWidgetIcon("reddit")}
                    onFilterChange={interactionActions.setRedditFilter}
                    onRefresh={interactionActions.refresh}
                    onHide={() => interactionActions.toggleWidget("reddit")}
                  />
                ) : null}
                {visibleWidgets.has("spotify") ? (
                  <SpotifyWidget
                    showIcon={showWidgetIcon("spotify")}
                    onRefresh={interactionActions.refresh}
                    onHide={() => interactionActions.toggleWidget("spotify")}
                  />
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-black/20 bg-white/46 p-8 text-center dark:border-white/20 dark:bg-black/18">
                <h2 className="text-lg font-semibold">No widgets enabled</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add a widget to bring the dashboard back to life.
                </p>
                <Button className="mt-4" variant="primary" onClick={openWidgetLibrary}>
                  <Plus className="h-4 w-4" />
                  Add widget
                </Button>
              </div>
            )}
          </section>

          <SettingsPanel
            id="kickoff-settings"
            open={settingsOpen}
            settings={settings}
            onChange={actions.update}
            onReset={actions.reset}
            onClose={() => setSettingsOpen(false)}
          />
        </main>
      </div>

      <WidgetLibrary
        open={widgetLibraryOpen}
        visibleWidgets={interactions.visibleWidgets}
        onToggle={(widgetId: WidgetId) => interactionActions.toggleWidget(widgetId)}
        onClose={() => setWidgetLibraryOpen(false)}
      />
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenWidgetLibrary={openWidgetLibrary}
        onOpenSettings={() => {
          setCommandPaletteOpen(false);
          setSettingsOpen(true);
        }}
      />
    </div>
  );
}

function getBackgroundStyle(settings: {
  backgroundMode: string;
  backgroundImage?: string;
  backgroundColor: string;
  backgroundGradient: string;
  theme: string;
}) {
  if (settings.backgroundMode === "image" && settings.backgroundImage) {
    return { backgroundImage: `url(${settings.backgroundImage})` };
  }

  if (settings.backgroundMode === "solid") {
    return {
      background: settings.theme === "dark" ? settings.backgroundColor : "#f2eee7"
    };
  }

  return {
    background:
      settings.theme === "dark"
        ? settings.backgroundGradient
        : "radial-gradient(circle at 18% 18%, rgba(220, 38, 38, 0.16), transparent 30%), radial-gradient(circle at 82% 12%, rgba(8, 145, 178, 0.16), transparent 28%), linear-gradient(135deg, #f7f2ea 0%, #edf4f5 48%, #f6f0e4 100%)"
  };
}
