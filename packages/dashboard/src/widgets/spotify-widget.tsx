import { AudioLines, Music2 } from "lucide-react";
import { WidgetShell } from "../components/widget-shell";

export function SpotifyWidget() {
  return (
    <WidgetShell title="Now playing" eyebrow="Spotify phase two">
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-md bg-green-500/22 text-green-100">
          <Music2 className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Demo track</p>
          <p className="truncate text-xs text-muted-foreground">Connect Spotify in phase two</p>
        </div>
      </div>
      <div className="mt-4 flex h-9 items-end gap-1">
        {Array.from({ length: 24 }, (_, index) => (
          <span
            key={index}
            className="w-full rounded-t bg-green-300/70"
            style={{ height: `${22 + ((index * 17) % 62)}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <AudioLines className="h-3.5 w-3.5" />
        placeholder widget
      </div>
    </WidgetShell>
  );
}
