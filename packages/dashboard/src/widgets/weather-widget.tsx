import { CloudSun, Droplets, Wind } from "lucide-react";
import { WidgetShell } from "../components/widget-shell";

export function WeatherWidget() {
  return (
    <WidgetShell title="Weather" eyebrow="Cape Town">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-5xl font-semibold tracking-normal">21</p>
          <p className="text-sm text-muted-foreground">clear with a light breeze</p>
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-yellow-300/18 text-yellow-100">
          <CloudSun className="h-7 w-7" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-md bg-white/50 p-3 dark:bg-white/8">
          <div className="mb-1 flex items-center gap-2 text-muted-foreground">
            <Wind className="h-3.5 w-3.5" />
            wind
          </div>
          <p className="font-semibold">14 km/h</p>
        </div>
        <div className="rounded-md bg-white/50 p-3 dark:bg-white/8">
          <div className="mb-1 flex items-center gap-2 text-muted-foreground">
            <Droplets className="h-3.5 w-3.5" />
            rain
          </div>
          <p className="font-semibold">8%</p>
        </div>
      </div>
    </WidgetShell>
  );
}
