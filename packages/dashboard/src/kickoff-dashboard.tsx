import { useMemo, useState } from "react";
import { Plus, Search, PlugZap } from "lucide-react";
import { Button } from "@kickoff/ui";
import { CommandPalette } from "./components/command-palette";
import { SavedLibrary } from "./components/saved-library";
import { SettingsPanel } from "./components/settings-panel";
import { TopBar } from "./components/top-bar";
import { WidgetLibrary } from "./components/widget-library";
import { WidgetFrame } from "./components/widget-frame";
import { YouTubeChannelSelector } from "./components/youtube-channel-selector";
import { YouTubePlayer } from "./components/youtube-player";
import { IntegrationWizard, type IntegrationWizardEntry } from "./components/integration-wizard";
import { useDashboardInteractions } from "./state/use-dashboard-interactions";
import { useDashboardSettings } from "./state/use-dashboard-settings";
import { useSteamProfile } from "./state/use-steam-profile";
import { useRedditFeed } from "./state/use-reddit-feed";
import { useSpotifyConnection } from "./state/use-spotify-connection";
import { useYouTubeConnection } from "./state/use-youtube-connection";
import type { WidgetId } from "./types";
import type { VideoItem } from "@kickoff/integrations";
import { RedditWidget } from "./widgets/reddit-widget";
import { SpotifyWidget } from "./widgets/spotify-widget";
import { SteamWidget } from "./widgets/steam-widget";
import { WeatherWidget } from "./widgets/weather-widget";
import { YouTubeHub } from "./widgets/youtube-hub";

export function KickoffDashboard() {
  const { settings, actions } = useDashboardSettings();
  const { state: interactions, actions: interactionActions } = useDashboardInteractions();
  const youtubeFeedChannelIds = useMemo(
    () => Array.from(new Set([...interactions.priorityChannelIds, ...interactions.selectedYouTubeChannelIds])),
    [interactions.priorityChannelIds, interactions.selectedYouTubeChannelIds]
  );
  const {
    connectionState: youtubeConnection,
    videosState: youtubeVideosState,
    actionState: youtubeActionState,
    subscriptionsState: youtubeSubscriptionsState,
    actions: youtubeActions
  } = useYouTubeConnection(youtubeFeedChannelIds);
  const steam = useSteamProfile();
  const reddit = useRedditFeed(interactions.redditFilter);
  const spotify = useSpotifyConnection();
  const [widgetLibraryOpen, setWidgetLibraryOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedLibraryOpen, setSavedLibraryOpen] = useState(false);
  const [selectedSavedTag, setSelectedSavedTag] = useState<string>();
  const [youtubeChannelSelectorOpen, setYouTubeChannelSelectorOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<VideoItem>();
  const [draggingWidget, setDraggingWidget] = useState<WidgetId>();
  const [integrationWizard, setIntegrationWizard] = useState<{ open: boolean; entry: IntegrationWizardEntry }>(() => ({
    open: !hasCompletedIntegrationOnboarding(),
    entry: "welcome"
  }));
  const backgroundStyle = getBackgroundStyle(settings);
  const visibleWidgets = new Set(interactions.visibleWidgets);
  const missingIntegrationCount = Number(youtubeConnection.status !== "connected") + Number(spotify.connection.status !== "connected");

  function completeIntegrationOnboarding() {
    try { window.localStorage.setItem(INTEGRATION_ONBOARDING_KEY, "complete"); } catch { /* Storage can be unavailable in previews. */ }
    setIntegrationWizard((current) => ({ ...current, open: false }));
  }

  function beginIntegrationSetup() {
    setIntegrationWizard({ open: true, entry: "setup" });
  }

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
                {missingIntegrationCount > 0 ? (
                  <Button variant="ghost" onClick={beginIntegrationSetup}>
                    <PlugZap className="h-4 w-4" />
                    Connect {missingIntegrationCount}
                  </Button>
                ) : null}
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
                Layout edit mode is on. Use the grip to reorder, the corner handle to resize, or the arrow to collapse a widget.
              </div>
            ) : null}

            {interactions.visibleWidgets.length > 0 ? (
              <div className="grid grid-flow-dense auto-rows-[4px] grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {visibleWidgets.has("youtube") ? (
                  <WidgetFrame id="youtube" editMode={settings.editMode} layout={interactions.widgetLayout.youtube!} order={interactions.visibleWidgets.indexOf("youtube")} dragging={draggingWidget === "youtube"} onDragging={setDraggingWidget} onDrop={interactionActions.moveWidget} onLayoutChange={(layout) => interactionActions.updateWidgetLayout("youtube", layout)}>
                  <YouTubeHub
                    videoStatuses={interactions.videoStatuses}
                    onSetVideoStatus={interactionActions.setVideoStatus}
                    savedVideos={interactions.savedVideos}
                    onSaveVideo={interactionActions.saveVideo}
                    onOpenSavedLibrary={(tag) => {
                      setSelectedSavedTag(tag);
                      setSavedLibraryOpen(true);
                    }}
                    onManageChannels={() => setYouTubeChannelSelectorOpen(true)}
                    videoProgress={interactions.videoProgress}
                    onPlayVideo={setPlayingVideo}
                    priorityChannelIds={interactions.priorityChannelIds}
                    onTogglePriorityChannel={interactionActions.togglePriorityChannel}
                    connectionState={youtubeConnection}
                    videos={youtubeVideosState.videos}
                    videoSource={youtubeVideosState.source}
                    videosLoading={youtubeVideosState.loading}
                    videosError={youtubeVideosState.error}
                    connecting={youtubeActionState.connecting}
                    disconnecting={youtubeActionState.disconnecting}
                    onConnect={youtubeActions.connect}
                    onDisconnect={youtubeActions.disconnect}
                    showIcon={showWidgetIcon("youtube")}
                    onRefresh={() => youtubeActions.refreshVideos(true)}
                    onHide={() => interactionActions.toggleWidget("youtube")}
                  />
                  </WidgetFrame>
                ) : null}
                {visibleWidgets.has("steam") ? (
                  <WidgetFrame id="steam" editMode={settings.editMode} layout={interactions.widgetLayout.steam!} order={interactions.visibleWidgets.indexOf("steam")} dragging={draggingWidget === "steam"} onDragging={setDraggingWidget} onDrop={interactionActions.moveWidget} onLayoutChange={(layout) => interactionActions.updateWidgetLayout("steam", layout)}>
                  <SteamWidget
                    profileInput={steam.profileInput}
                    result={steam.result}
                    loading={steam.loading}
                    onProfileInputChange={steam.setProfileInput}
                    showIcon={showWidgetIcon("steam")}
                    onRefresh={() => {
                      steam.load(true);
                      interactionActions.refresh();
                    }}
                    onHide={() => interactionActions.toggleWidget("steam")}
                  />
                  </WidgetFrame>
                ) : null}
                {visibleWidgets.has("weather") ? (
                  <WidgetFrame id="weather" editMode={settings.editMode} layout={interactions.widgetLayout.weather!} order={interactions.visibleWidgets.indexOf("weather")} dragging={draggingWidget === "weather"} onDragging={setDraggingWidget} onDrop={interactionActions.moveWidget} onLayoutChange={(layout) => interactionActions.updateWidgetLayout("weather", layout)}>
                  <WeatherWidget
                    location={interactions.weatherLocation}
                    showIcon={showWidgetIcon("weather")}
                    onLocationChange={interactionActions.setWeatherLocation}
                    onRefresh={interactionActions.refresh}
                    onHide={() => interactionActions.toggleWidget("weather")}
                  />
                  </WidgetFrame>
                ) : null}
                {visibleWidgets.has("reddit") ? (
                  <WidgetFrame id="reddit" editMode={settings.editMode} layout={interactions.widgetLayout.reddit!} order={interactions.visibleWidgets.indexOf("reddit")} dragging={draggingWidget === "reddit"} onDragging={setDraggingWidget} onDrop={interactionActions.moveWidget} onLayoutChange={(layout) => interactionActions.updateWidgetLayout("reddit", layout)}>
                  <RedditWidget
                    filter={interactions.redditFilter}
                    communities={reddit.communities}
                    result={reddit.result}
                    loading={reddit.loading}
                    showIcon={showWidgetIcon("reddit")}
                    onFilterChange={interactionActions.setRedditFilter}
                    onCommunitiesChange={reddit.setCommunities}
                    onRefresh={() => {
                      void reddit.load(true);
                      interactionActions.refresh();
                    }}
                    onHide={() => interactionActions.toggleWidget("reddit")}
                  />
                  </WidgetFrame>
                ) : null}
                {visibleWidgets.has("spotify") ? (
                  <WidgetFrame id="spotify" editMode={settings.editMode} layout={interactions.widgetLayout.spotify!} order={interactions.visibleWidgets.indexOf("spotify")} dragging={draggingWidget === "spotify"} onDragging={setDraggingWidget} onDrop={interactionActions.moveWidget} onLayoutChange={(layout) => interactionActions.updateWidgetLayout("spotify", layout)}>
                  <SpotifyWidget
                    showIcon={showWidgetIcon("spotify")}
                    connection={spotify.connection}
                    playback={spotify.playback}
                    recentlyPlayed={spotify.recentlyPlayed}
                    loading={spotify.loading}
                    onConnect={() => { void spotify.connect(); }}
                    onDisconnect={() => { void spotify.disconnect(); }}
                    onRefresh={() => { void spotify.refresh(); interactionActions.refresh(); }}
                    onHide={() => interactionActions.toggleWidget("spotify")}
                  />
                  </WidgetFrame>
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
      <SavedLibrary
        open={savedLibraryOpen}
        videos={Object.values(interactions.savedVideos).sort((left, right) =>
          right.savedAt.localeCompare(left.savedAt)
        )}
        selectedTag={selectedSavedTag}
        onSelectTag={setSelectedSavedTag}
        onRemove={interactionActions.removeSavedVideo}
        videoProgress={interactions.videoProgress}
        onPlay={setPlayingVideo}
        onClose={() => setSavedLibraryOpen(false)}
      />
      <YouTubeChannelSelector
        open={youtubeChannelSelectorOpen}
        subscriptions={youtubeSubscriptionsState.subscriptions}
        selectedChannelIds={interactions.selectedYouTubeChannelIds}
        priorityChannelIds={interactions.priorityChannelIds}
        loading={youtubeSubscriptionsState.loading}
        error={youtubeSubscriptionsState.error}
        onRefresh={() => youtubeActions.refreshSubscriptions(true)}
        onSave={interactionActions.setSelectedYouTubeChannels}
        onClose={() => setYouTubeChannelSelectorOpen(false)}
      />
      <YouTubePlayer
        video={playingVideo}
        progress={playingVideo ? interactions.videoProgress[playingVideo.id] : undefined}
        onProgress={interactionActions.setVideoProgress}
        onComplete={interactionActions.completeVideo}
        onClose={() => setPlayingVideo(undefined)}
      />
      <IntegrationWizard
        open={integrationWizard.open}
        entry={integrationWizard.entry}
        youtubeStatus={youtubeConnection.status}
        spotifyStatus={spotify.connection.status}
        youtubeBusy={youtubeActionState.connecting}
        spotifyBusy={spotify.loading}
        onConnectYouTube={() => {
          if (integrationWizard.entry === "welcome") setIntegrationWizard({ open: true, entry: "setup" });
          else void youtubeActions.connect();
        }}
        onConnectSpotify={() => { void spotify.connect(); }}
        onComplete={completeIntegrationOnboarding}
      />
    </div>
  );
}

const INTEGRATION_ONBOARDING_KEY = "kickoff.integration-onboarding.v1";

function hasCompletedIntegrationOnboarding() {
  try { return window.localStorage.getItem(INTEGRATION_ONBOARDING_KEY) === "complete"; }
  catch { return false; }
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
