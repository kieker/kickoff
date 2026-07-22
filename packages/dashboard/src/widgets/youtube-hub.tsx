import { Check, Clock3, ExternalLink, Link, Link2Off, Loader2, Play, Star } from "lucide-react";
import { SiYoutube } from "react-icons/si";
import { youtubeVideos, type VideoItem, type YouTubeConnectionState } from "@kickoff/integrations";
import { openExternal } from "@kickoff/platform";
import { Button } from "@kickoff/ui";
import { WidgetShell } from "../components/widget-shell";

type YouTubeHubProps = {
  videoStatuses: Record<string, VideoItem["status"]>;
  onSetVideoStatus(videoId: string, status: VideoItem["status"]): void;
  connectionState: YouTubeConnectionState;
  onConnect(): void;
  onDisconnect(): void;
  showIcon: boolean;
  onRefresh?: () => void;
  onHide?: () => void;
};

export function YouTubeHub({
  videoStatuses,
  onSetVideoStatus,
  connectionState,
  onConnect,
  onDisconnect,
  showIcon,
  onHide
}: YouTubeHubProps) {
  const videos = youtubeVideos.map((video) => ({
    ...video,
    status: videoStatuses[video.id] ?? video.status
  }));
  const priorityCount = videos.filter((video) => video.group === "Priority").length;
  const savedCount = videos.filter((video) => video.status === "saved").length;

  return (
    <WidgetShell
      className="lg:col-span-2 lg:row-span-2"
      title="YouTube queue"
      eyebrow={`${priorityCount} priority channels / ${savedCount} saved`}
      icon={showIcon ? <SiYoutube className="h-5 w-5" /> : undefined}
      action={
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onHide}>
            Hide
          </Button>
          <Button variant="primary" size="sm" onClick={() => openExternal("https://youtube.com")}>
            <Play className="h-4 w-4" />
            Open queue
          </Button>
        </div>
      }
    >
      <div className="grid gap-3">
        <ConnectionPanel state={connectionState} onConnect={onConnect} onDisconnect={onDisconnect} />
        {videos.map((video) => (
          <article
            key={video.id}
            className="grid gap-3 rounded-md border border-black/10 bg-white/48 p-3 sm:grid-cols-[132px_minmax(0,1fr)] dark:border-white/10 dark:bg-black/18"
          >
            <button
              type="button"
              className="group relative aspect-video overflow-hidden rounded-md bg-gradient-to-br from-red-500/60 via-zinc-900 to-cyan-500/40"
              onClick={() => openExternal(video.url)}
            >
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-black/62 text-white transition group-hover:scale-105">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              </span>
              <span className="absolute bottom-2 right-2 rounded bg-black/72 px-1.5 py-0.5 text-[11px]">
                {video.duration}
              </span>
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
                <Button
                  size="sm"
                  variant={(videoStatuses[video.id] ?? video.status) === "saved" ? "primary" : "ghost"}
                  onClick={() => onSetVideoStatus(video.id, "saved")}
                >
                  <Star className="h-3.5 w-3.5" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openExternal(video.url)}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </WidgetShell>
  );
}

function ConnectionPanel({
  state,
  onConnect,
  onDisconnect
}: {
  state: YouTubeConnectionState;
  onConnect(): void;
  onDisconnect(): void;
}) {
  const isConnecting = state.status === "connecting";
  const canDisconnect = state.status === "connected" || state.status === "connecting";
  const message = getConnectionMessage(state);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-black/10 bg-white/40 px-3 py-2 text-xs dark:border-white/10 dark:bg-black/18">
      <div className="flex min-w-0 items-center gap-2">
        <ConnectionStatusIcon status={state.status} />
        <div className="min-w-0">
          <p className="font-semibold">{getConnectionLabel(state.status)}</p>
          <p className="truncate text-muted-foreground">{message}</p>
        </div>
      </div>
      {canDisconnect ? (
        <Button size="sm" variant="ghost" onClick={onDisconnect}>
          <Link2Off className="h-3.5 w-3.5" />
          Disconnect
        </Button>
      ) : (
        <Button size="sm" variant="secondary" onClick={onConnect} disabled={isConnecting}>
          {isConnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link className="h-3.5 w-3.5" />}
          Connect
        </Button>
      )}
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
    return `Signed in as ${state.channel.title}.`;
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
