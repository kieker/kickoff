import { Check, Clock3, ExternalLink, Play, Star } from "lucide-react";
import { youtubeVideos } from "@kickoff/integrations";
import { openExternal } from "@kickoff/platform";
import { Button } from "@kickoff/ui";
import { WidgetShell } from "../components/widget-shell";

export function YouTubeHub() {
  const priorityCount = youtubeVideos.filter((video) => video.group === "Priority").length;
  const savedCount = youtubeVideos.filter((video) => video.status === "saved").length;

  return (
    <WidgetShell
      className="lg:col-span-2 lg:row-span-2"
      title="YouTube queue"
      eyebrow={`${priorityCount} priority channels / ${savedCount} saved`}
      action={
        <Button variant="primary" size="sm">
          <Play className="h-4 w-4" />
          Open queue
        </Button>
      }
    >
      <div className="grid gap-3">
        {youtubeVideos.map((video) => (
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
                <StatusIcon status={video.status} />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-black/8 px-2 py-1 text-[11px] text-muted-foreground dark:bg-white/10">
                  {video.group}
                </span>
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

function StatusIcon({ status }: { status: "new" | "seen" | "saved" }) {
  if (status === "saved") {
    return <Star className="h-4 w-4 shrink-0 text-yellow-300" />;
  }

  if (status === "seen") {
    return <Check className="h-4 w-4 shrink-0 text-emerald-300" />;
  }

  return <Clock3 className="h-4 w-4 shrink-0 text-accent" />;
}
