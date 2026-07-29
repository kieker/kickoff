import { Check, Clock3, ExternalLink, Link, Link2Off, ListFilter, Loader2, Pin, Play, Plus, RefreshCw, Star, X } from "lucide-react";
import { useState } from "react";
import { SiYoutube } from "react-icons/si";
import { type VideoItem, type YouTubeConnectionState } from "@kickoff/integrations";
import { openExternal } from "@kickoff/platform";
import { Button } from "@kickoff/ui";
import { WidgetShell } from "../components/widget-shell";
import type { SavedVideo, VideoProgress } from "../state/use-dashboard-interactions";

type YouTubeHubProps = {
  videoStatuses: Record<string, VideoItem["status"]>;
  onSetVideoStatus(videoId: string, status: VideoItem["status"]): void;
  savedVideos: Record<string, SavedVideo>;
  onSaveVideo(video: VideoItem, tags: string[]): void;
  onOpenSavedLibrary(tag?: string): void;
  onManageChannels(): void;
  videoProgress: Record<string, VideoProgress>;
  onPlayVideo(video: VideoItem): void;
  priorityChannelIds: string[];
  onTogglePriorityChannel(channelId: string): void;
  connectionState: YouTubeConnectionState;
  videos: VideoItem[];
  videoSource: "demo" | "connected";
  videosLoading: boolean;
  videosError?: string;
  connecting: boolean;
  disconnecting: boolean;
  onConnect(): void;
  onDisconnect(): void;
  showIcon: boolean;
  onRefresh?: () => void;
  onHide?: () => void;
};

export function YouTubeHub({
  videoStatuses,
  onSetVideoStatus,
  savedVideos,
  onSaveVideo,
  onOpenSavedLibrary,
  onManageChannels,
  videoProgress,
  onPlayVideo,
  priorityChannelIds,
  onTogglePriorityChannel,
  connectionState,
  videos: rawVideos,
  videoSource,
  videosLoading,
  videosError,
  connecting,
  disconnecting,
  onConnect,
  onDisconnect,
  showIcon,
  onRefresh,
  onHide
}: YouTubeHubProps) {
  const [taggingVideoId, setTaggingVideoId] = useState<string>();
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const videos = rawVideos
    .map((video) => ({
      ...video,
      status: videoStatuses[video.id] ?? video.status,
      group: video.channelId && priorityChannelIds.includes(video.channelId) ? "Priority" : video.group
    }))
    .sort((left, right) => Number(right.group === "Priority") - Number(left.group === "Priority"));
  const priorityCount = priorityChannelIds.length;
  const savedCount = Object.keys(savedVideos).length;
  const availableTags = Array.from(new Set(Object.values(savedVideos).flatMap((video) => video.tags))).sort();
  const eyebrowPrefix = videoSource === "connected" ? "Subscription feed" : "Demo queue";

  return (
    <WidgetShell
      className="lg:col-span-2 lg:row-span-2"
      title="YouTube queue"
      eyebrow={`${eyebrowPrefix} / ${priorityCount} priority / ${savedCount} saved`}
      icon={showIcon ? <SiYoutube className="h-5 w-5" /> : undefined}
      action={
        <div className="flex gap-2">
          <ConnectionPopover
            state={connectionState}
            connecting={connecting}
            disconnecting={disconnecting}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
          <Button variant="ghost" size="sm" onClick={onManageChannels}>
            <ListFilter className="h-4 w-4" />
            Channels
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onOpenSavedLibrary()}>
            <Star className="h-4 w-4" />
            Saved ({savedCount})
          </Button>
          <Button variant="ghost" size="sm" onClick={onHide}>
            Hide
          </Button>
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={videosLoading}>
            <RefreshCw className={videosLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => openExternal("https://youtube.com")}>
            <Play className="h-4 w-4" />
            Open queue
          </Button>
        </div>
      }
    >
      <div className="grid gap-3">
        {videosError ? (
          <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-100">
            {videosError}
          </p>
        ) : null}
        {videos.map((video) => (
          <article
            key={video.id}
            className="grid gap-3 rounded-md border border-black/10 bg-white/48 p-3 sm:grid-cols-[132px_minmax(0,1fr)] dark:border-white/10 dark:bg-black/18"
          >
            <button
              type="button"
              className="group relative aspect-video overflow-hidden rounded-md bg-gradient-to-br from-red-500/60 via-zinc-900 to-cyan-500/40"
              onClick={() => onPlayVideo(video)}
            >
              {video.thumbnailUrl ? (
                <img src={video.thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : null}
              <span className="absolute inset-0 bg-black/18 transition group-hover:bg-black/10" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-black/62 text-white transition group-hover:scale-105">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              </span>
              <span className="absolute bottom-2 right-2 rounded bg-black/72 px-1.5 py-0.5 text-[11px]">
                {video.duration}
              </span>
              <VideoProgressBar progress={videoProgress[video.id]} />
            </button>

            <div className="min-w-0">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-semibold">{video.title}</h3>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {video.channel} / {video.age}
                  </p>
                </div>
                <StatusIcon status={videoStatuses[video.id] ?? video.status} />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-black/8 px-2 py-1 text-[11px] text-muted-foreground dark:bg-white/10">
                  {video.group}
                </span>
                <Button
                  size="sm"
                  variant={(videoStatuses[video.id] ?? video.status) === "seen" ? "primary" : "ghost"}
                  onClick={() => onSetVideoStatus(video.id, "seen")}
                >
                  <Check className="h-3.5 w-3.5" />
                  Seen
                </Button>
                {video.channelId ? (
                  <Button
                    size="sm"
                    variant={priorityChannelIds.includes(video.channelId) ? "primary" : "ghost"}
                    onClick={() => onTogglePriorityChannel(video.channelId as string)}
                  >
                    <Pin className="h-3.5 w-3.5" />
                    {priorityChannelIds.includes(video.channelId) ? "Priority" : "Prioritize"}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant={savedVideos[video.id] ? "primary" : "ghost"}
                  onClick={() => {
                    setTaggingVideoId(taggingVideoId === video.id ? undefined : video.id);
                    setDraftTags(savedVideos[video.id]?.tags ?? []);
                    setNewTag("");
                  }}
                >
                  <Star className="h-3.5 w-3.5" />
                  {savedVideos[video.id] ? "Saved" : "Save"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openExternal(video.url)}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </Button>
              </div>

              {taggingVideoId === video.id ? (
                <div className="mt-3 rounded-md border border-accent/25 bg-accent/8 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">Save to tags</p>
                    <button type="button" onClick={() => setTaggingVideoId(undefined)} aria-label="Close tag picker">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={
                          draftTags.includes(tag)
                            ? "rounded bg-accent px-2 py-1 text-[11px] text-accent-foreground"
                            : "rounded bg-black/8 px-2 py-1 text-[11px] dark:bg-white/10"
                        }
                        onClick={() =>
                          setDraftTags((current) =>
                            current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
                          )
                        }
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={newTag}
                      onChange={(event) => setNewTag(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && newTag.trim()) {
                          event.preventDefault();
                          setDraftTags((current) => [...new Set([...current, newTag.trim()])]);
                          setNewTag("");
                        }
                      }}
                      className="min-w-0 flex-1 rounded border border-black/10 bg-white/60 px-2 py-1 text-xs outline-none focus:border-accent dark:border-white/10 dark:bg-black/20"
                      placeholder="Create a tag"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={!newTag.trim()}
                      onClick={() => {
                        setDraftTags((current) => [...new Set([...current, newTag.trim()])]);
                        setNewTag("");
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        const pendingTag = newTag.trim();
                        onSaveVideo(video, pendingTag ? [...new Set([...draftTags, pendingTag])] : draftTags);
                        setTaggingVideoId(undefined);
                      }}
                    >
                      Save to library
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </WidgetShell>
  );
}

function ConnectionPopover({
  state,
  connecting,
  disconnecting,
  onConnect,
  onDisconnect
}: {
  state: YouTubeConnectionState;
  connecting: boolean;
  disconnecting: boolean;
  onConnect(): void;
  onDisconnect(): void;
}) {
  const [open, setOpen] = useState(false);
  const isConnecting = state.status === "connecting" || connecting;
  const canDisconnect = state.status === "connected" || state.status === "connecting";
  const message = getConnectionMessage(state);

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen((current) => !current)}
        aria-label="YouTube connection"
        aria-expanded={open}
      >
        <ConnectionStatusIcon status={state.status} />
      </Button>
      {open ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-lg border border-black/10 bg-background p-3 text-xs shadow-xl dark:border-white/12">
          <div className="flex items-start gap-2">
            <ConnectionStatusIcon status={state.status} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{getConnectionLabel(state.status)}</p>
              <p className="mt-1 leading-relaxed text-muted-foreground">{message}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close connection details">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="mt-3 flex justify-end">
            {canDisconnect ? (
              <Button size="sm" variant="ghost" onClick={onDisconnect} disabled={disconnecting}>
                {disconnecting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Link2Off className="h-3.5 w-3.5" />
                )}
                Disconnect
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={onConnect} disabled={isConnecting}>
                {isConnecting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Link className="h-3.5 w-3.5" />
                )}
                Connect
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ConnectionStatusIcon({ status }: { status: YouTubeConnectionState["status"] }) {
  if (status === "connecting") {
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />;
  }

  if (status === "connected") {
    return <Check className="h-4 w-4 shrink-0 text-emerald-300" />;
  }

  if (status === "error") {
    return <Link2Off className="h-4 w-4 shrink-0 text-red-300" />;
  }

  return <Link className="h-4 w-4 shrink-0 text-accent" />;
}

function getConnectionLabel(status: YouTubeConnectionState["status"]) {
  switch (status) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting";
    case "disconnected":
      return "Disconnected";
    case "error":
      return "Needs setup";
    case "demo":
    default:
      return "Demo mode";
  }
}

function getConnectionMessage(state: YouTubeConnectionState) {
  if ("message" in state && state.message) {
    return state.message;
  }

  if (state.status === "disconnected") {
    return "Ready to connect a Google account.";
  }

  if (state.status === "connected") {
    return state.channel ? `Signed in as ${state.channel.title}.` : "YouTube is connected.";
  }

  return "Using curated beta videos until live data is connected.";
}

function StatusIcon({ status }: { status: "new" | "seen" | "saved" }) {
  if (status === "saved") {
    return <Star className="h-4 w-4 shrink-0 text-yellow-300" />;
  }

  if (status === "seen") {
    return <Check className="h-4 w-4 shrink-0 text-emerald-300" />;
  }

  return <Clock3 className="h-4 w-4 shrink-0 text-accent" />;
}

function VideoProgressBar({ progress }: { progress?: VideoProgress }) {
  if (!progress || progress.duration <= 0) {
    return null;
  }
  const percentage = Math.min(100, Math.round((progress.seconds / progress.duration) * 100));
  return (
    <>
      <span className="absolute bottom-0 left-0 h-1 bg-accent" style={{ width: `${percentage}%` }} />
      <span className="absolute bottom-2 left-2 rounded bg-black/72 px-1.5 py-0.5 text-[11px] text-white">
        {progress.completed ? "Watched" : `${percentage}%`}
      </span>
    </>
  );
}
