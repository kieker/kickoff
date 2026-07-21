import { Gamepad2, Trophy } from "lucide-react";
import { SiSteam } from "react-icons/si";
import { steamGames } from "@kickoff/integrations";
import { WidgetShell } from "../components/widget-shell";

type SteamWidgetProps = {
  showIcon: boolean;
  onRefresh?: () => void;
  onHide?: () => void;
};

export function SteamWidget({ showIcon, onRefresh, onHide }: SteamWidgetProps) {
  return (
    <WidgetShell
      title="Steam"
      eyebrow="recently played"
      icon={showIcon ? <SiSteam className="h-5 w-5" /> : undefined}
      onRefresh={onRefresh}
      onHide={onHide}
    >
      <div className="mb-4 flex items-center gap-3 rounded-md border border-black/10 bg-white/46 p-3 dark:border-white/10 dark:bg-white/8">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-cyan-500/22 text-cyan-100">
          <Gamepad2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">kieker</p>
          <p className="text-xs text-muted-foreground">3 games active this week</p>
        </div>
      </div>

      <div className="space-y-3">
        {steamGames.map((game) => (
          <div key={game.id}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="truncate font-medium">{game.title}</span>
              <span className="shrink-0 text-muted-foreground">{game.playtime}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-cyan-400"
                style={{ width: `${game.progress}%` }}
              />
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Trophy className="h-3 w-3" />
              {game.lastPlayed}
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}
