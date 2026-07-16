import { Plus, Search } from "lucide-react";
import { Button } from "@kickoff/ui";
import { SettingsPanel } from "./components/settings-panel";
import { TopBar } from "./components/top-bar";
import { useDashboardSettings } from "./state/use-dashboard-settings";
import { RedditWidget } from "./widgets/reddit-widget";
import { SpotifyWidget } from "./widgets/spotify-widget";
import { SteamWidget } from "./widgets/steam-widget";
import { WeatherWidget } from "./widgets/weather-widget";
import { YouTubeHub } from "./widgets/youtube-hub";

export function KickoffDashboard() {
  const { settings, actions } = useDashboardSettings();
  const backgroundStyle = getBackgroundStyle(settings);

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
          onToggleEditMode={() => actions.update({ editMode: !settings.editMode })}
        />

        <main className="grid grid-cols-1 items-start xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 p-4 lg:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-normal">Today in media</h1>
                <p className="text-sm text-muted-foreground">
                  YouTube first, with games and communities close by.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">
                  <Search className="h-4 w-4" />
                  Find
                </Button>
                <Button variant="primary">
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

            <div className="grid auto-rows-min grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              <YouTubeHub />
              <SteamWidget />
              <WeatherWidget />
              <RedditWidget />
              <SpotifyWidget />
            </div>
          </section>

          <SettingsPanel
            settings={settings}
            onChange={actions.update}
            onReset={actions.reset}
          />
        </main>
      </div>
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
