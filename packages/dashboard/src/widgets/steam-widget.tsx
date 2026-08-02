import { FormEvent, useState } from "react";
import { CalendarDays, Clock3, ExternalLink, Gamepad2, Loader2, Search } from "lucide-react";
import { SiSteam } from "react-icons/si";
import { steamGames } from "@kickoff/integrations";
import { openExternal, type PlatformSteamResult } from "@kickoff/platform";
import { Button } from "@kickoff/ui";
import { WidgetShell } from "../components/widget-shell";

type SteamWidgetProps = {
  profileInput: string;
  result?: PlatformSteamResult;
  loading: boolean;
  showIcon: boolean;
  onProfileInputChange(value: string): void;
  onRefresh?: () => void;
  onHide?: () => void;
};

export function SteamWidget({
  profileInput,
  result,
  loading,
  showIcon,
  onProfileInputChange,
  onRefresh,
  onHide
}: SteamWidgetProps) {
  const [configureOpen, setConfigureOpen] = useState(!profileInput);
  const [draftInput, setDraftInput] = useState(profileInput);
  const liveProfile = result?.status === "connected" ? result.profile : undefined;
  const liveGames = result?.status === "connected" ? result.games : undefined;
  const longestPlaytime = Math.max(0, ...(liveGames ?? []).map((game) => game.playtimeMinutes));

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!draftInput.trim()) return;
    onProfileInputChange(draftInput);
    setConfigureOpen(false);
  }

  return (
    <WidgetShell
      title="Steam"
      eyebrow={liveProfile ? "live data" : result?.status === "demo" ? "demo data" : "recently played"}
      icon={showIcon ? <SiSteam className="h-5 w-5" /> : undefined}
      onRefresh={onRefresh}
      onHide={onHide}
      action={
        <Button
          aria-label="Choose Steam profile"
          size="icon"
          variant={configureOpen ? "primary" : "ghost"}
          onClick={() => setConfigureOpen((open) => !open)}
        >
          <Search className="h-4 w-4" />
        </Button>
      }
    >
      {configureOpen ? (
        <form onSubmit={saveProfile} className="mb-4 rounded-md border border-black/10 bg-white/50 p-3 dark:border-white/10 dark:bg-white/8">
          <label className="mb-2 block text-xs font-medium" htmlFor="steam-profile-input">Steam profile</label>
          <div className="flex gap-2">
            <input
              id="steam-profile-input"
              className="min-w-0 flex-1 rounded-md border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 dark:border-white/10 dark:bg-black/18"
              placeholder="SteamID64, vanity name, or profile URL"
              value={draftInput}
              onChange={(event) => setDraftInput(event.currentTarget.value)}
            />
            <Button type="submit" size="sm" variant="primary" disabled={!draftInput.trim()}>Load</Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Recently played games require a public Steam profile.</p>
        </form>
      ) : null}

      {loading ? (
        <div className="mb-4 flex items-center rounded-md bg-white/46 p-3 text-xs text-muted-foreground dark:bg-white/8">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Steam profile
        </div>
      ) : null}

      {result?.status === "error" ? (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs">
          <p className="font-semibold text-red-500">Steam profile unavailable</p>
          <p className="mt-1 text-muted-foreground">{result.message}</p>
        </div>
      ) : null}

      <div className="mb-4 flex items-center gap-3 rounded-md border border-black/10 bg-white/46 p-3 dark:border-white/10 dark:bg-white/8">
        {liveProfile?.avatarUrl ? (
          <img src={liveProfile.avatarUrl} alt="" className="h-11 w-11 rounded-md object-cover" />
        ) : (
          <div className="grid h-11 w-11 place-items-center rounded-md bg-cyan-500/22 text-cyan-100"><Gamepad2 className="h-5 w-5" /></div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{liveProfile?.name ?? "kieker"}</p>
          <p className="text-xs text-muted-foreground">
            {liveProfile && liveGames
              ? `${liveProfile.status} on Steam / ${liveGames.length} recently played ${liveGames.length === 1 ? "game" : "games"}`
              : "3 games active this week"}
          </p>
        </div>
        {liveProfile ? (
          <Button aria-label="Open Steam profile" size="icon" variant="ghost" onClick={() => openExternal(liveProfile.profileUrl)}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="space-y-3">
        {liveGames?.length === 0 ? <p className="text-xs text-muted-foreground">No public recently played games were returned.</p> : null}
        {(liveGames ?? steamGames).map((game) => {
          const isLive = "playtimeMinutes" in game;
          const progress = isLive && longestPlaytime > 0
            ? Math.min(100, Math.round((game.playtimeMinutes / longestPlaytime) * 100))
            : "progress" in game ? game.progress : 0;
          return (
            <button
              key={game.id}
              type="button"
              className="block w-full text-left"
              onClick={() => isLive && openExternal(`https://store.steampowered.com/app/${game.id}`)}
            >
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-medium">{game.title}</span>
                <span
                  className="flex shrink-0 items-center gap-1 text-muted-foreground"
                  aria-label={isLive ? `${formatPlaytime(game.playtimeMinutes)} lifetime playtime` : game.playtime}
                  title="Lifetime playtime"
                >
                  {isLive ? <Clock3 aria-hidden="true" className="h-3 w-3" /> : null}
                  {isLive ? formatPlaytime(game.playtimeMinutes) : game.playtime}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                {isLive ? <CalendarDays aria-hidden="true" className="h-3 w-3 shrink-0" /> : null}
                {isLive ? formatLastPlayed(game.lastPlayedAt, game.recentPlaytimeMinutes) : game.lastPlayed}
              </p>
            </button>
          );
        })}
      </div>
    </WidgetShell>
  );
}

function formatPlaytime(minutes: number) {
  return minutes < 60 ? `${minutes}m` : `${Math.round(minutes / 60)}h`;
}

function formatLastPlayed(value: string | undefined, recentMinutes: number) {
  const recent = recentMinutes > 0 ? `${formatPlaytime(recentMinutes)} in the last 2 weeks` : "No time in the last 2 weeks";
  if (!value) return recent;
  return `${recent} · ${new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
    Math.round((new Date(value).getTime() - Date.now()) / 86_400_000), "day"
  )}`;
}