import { AudioLines, ExternalLink, Loader2, Music2, Pause, Play } from "lucide-react";
import { SiSpotify } from "react-icons/si";
import { Button } from "@kickoff/ui";
import { openExternal, type PlatformSpotifyConnectionState, type PlatformSpotifyPlaybackResult, type PlatformSpotifyRecentlyPlayedResult } from "@kickoff/platform";
import { WidgetShell } from "../components/widget-shell";

type Props = { showIcon: boolean; connection: PlatformSpotifyConnectionState; playback?: PlatformSpotifyPlaybackResult; recentlyPlayed?: PlatformSpotifyRecentlyPlayedResult; loading: boolean; onConnect(): void; onDisconnect(): void; onRefresh(): void; onHide?(): void };

export function SpotifyWidget({ showIcon, connection, playback, recentlyPlayed, loading, onConnect, onDisconnect, onRefresh, onHide }: Props) {
  const current = playback?.status === "connected" ? playback.playback : undefined;
  const track = current?.track;
  const recentTracks = recentlyPlayed?.tracks
    .filter((recentTrack) => recentTrack.id !== track?.id)
    .slice(0, track ? 3 : 5) ?? [];
  return (
    <WidgetShell title="Now playing" eyebrow={connection.status === "connected" ? "Spotify connected" : "Spotify"} icon={showIcon ? <SiSpotify className="h-5 w-5" /> : undefined} onRefresh={onRefresh} onHide={onHide}>
      {connection.status !== "connected" ? (
        <div className="rounded-md border border-white/10 bg-black/10 p-4">
          <p className="text-sm font-medium">Connect your Spotify account</p>
          <p className="mt-1 text-xs text-muted-foreground">See your current track and active Spotify Connect device.</p>
          {connection.message ? <p className={`mt-3 text-xs ${connection.status === "error" ? "text-red-400" : "text-muted-foreground"}`}>{connection.message}</p> : null}
          <Button className="mt-4" variant="primary" onClick={onConnect} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SiSpotify className="h-4 w-4" />}Connect Spotify</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            {track?.albumArtUrl ? <img src={track.albumArtUrl} alt="" className="h-16 w-16 rounded-md object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-md bg-green-500/22 text-green-100"><Music2 className="h-6 w-6" /></div>}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{track?.title || "Nothing playing"}</p>
              <p className="truncate text-xs text-muted-foreground">{track ? `${track.artists}${track.album ? ` · ${track.album}` : ""}` : "Start playback in Spotify to see it here."}</p>
              {current?.deviceName ? <p className="mt-1 truncate text-[11px] text-muted-foreground">On {current.deviceName}</p> : null}
            </div>
            {track ? <Button aria-label="Open in Spotify" size="icon" variant="ghost" onClick={() => openExternal(track.url)}><ExternalLink className="h-4 w-4" /></Button> : null}
          </div>
          {track ? <div className="mt-4"><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-green-400" style={{ width: `${Math.min(100, (current!.progressMs / track.durationMs) * 100)}%` }} /></div><div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">{current?.isPlaying ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}{current?.isPlaying ? "Playing" : "Paused"}</div></div> : null}
          {playback?.status === "error" ? <p className="mt-3 text-xs text-red-400">{playback.message}</p> : null}
          {recentTracks.length > 0 ? (
            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Recently played</p>
              <div className="space-y-1">
                {recentTracks.map((recentTrack) => (
                  <button
                    key={`${recentTrack.id}-${recentTrack.playedAt}`}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-md p-1.5 text-left transition hover:bg-white/7"
                    onClick={() => openExternal(recentTrack.url)}
                  >
                    {recentTrack.albumArtUrl ? <img src={recentTrack.albumArtUrl} alt="" className="h-9 w-9 rounded object-cover" /> : <div className="grid h-9 w-9 place-items-center rounded bg-green-500/15"><Music2 className="h-4 w-4" /></div>}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">{recentTrack.title}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{recentTrack.artists}</span>
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{relativeTime(recentTrack.playedAt)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : recentlyPlayed?.status === "error" ? <p className="mt-3 text-xs text-red-400">{recentlyPlayed.message} Reconnect Spotify if this persists.</p> : null}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><AudioLines className="h-3.5 w-3.5" />{connection.user?.name || "Spotify"}</span><button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={onDisconnect}>Disconnect</button></div>
        </>
      )}
    </WidgetShell>
  );
}

function relativeTime(value: string) {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (elapsedMinutes < 1) return "now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h`;
  return `${Math.floor(elapsedHours / 24)}d`;
}
