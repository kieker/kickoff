import { ExternalLink, Play, Trash2, X } from "lucide-react";
import { openExternal } from "@kickoff/platform";
import { Button } from "@kickoff/ui";
import type { SavedVideo } from "../state/use-dashboard-interactions";

type SavedLibraryProps = {
  open: boolean;
  videos: SavedVideo[];
  selectedTag?: string;
  onSelectTag(tag?: string): void;
  onRemove(videoId: string): void;
  onClose(): void;
};

export function SavedLibrary({
  open,
  videos,
  selectedTag,
  onSelectTag,
  onRemove,
  onClose
}: SavedLibraryProps) {
  if (!open) {
    return null;
  }

  const tags = Array.from(new Set(videos.flatMap((video) => video.tags))).sort();
  const filteredVideos = selectedTag
    ? videos.filter((video) => video.tags.includes(selectedTag))
    : videos;

  return (
    <div className="fixed inset-0 z-50 bg-black/68 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <section className="mx-auto flex max-h-[calc(100vh-2rem)] max-w-5xl flex-col overflow-hidden rounded-xl border border-white/12 bg-background shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-black/10 p-4 dark:border-white/10">
          <div>
            <h2 className="text-xl font-semibold">Saved videos</h2>
            <p className="text-sm text-muted-foreground">
              {filteredVideos.length} {selectedTag ? `tagged “${selectedTag}”` : "in your library"}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
            Close
          </Button>
        </header>

        <div className="flex flex-wrap gap-2 border-b border-black/10 p-4 dark:border-white/10">
          <Button size="sm" variant={selectedTag ? "ghost" : "primary"} onClick={() => onSelectTag()}>
            All
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag}
              size="sm"
              variant={selectedTag === tag ? "primary" : "ghost"}
              onClick={() => onSelectTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>

        <div className="grid gap-3 overflow-y-auto p-4 md:grid-cols-2">
          {filteredVideos.map((video) => (
            <article
              key={video.id}
              className="grid gap-3 rounded-lg border border-black/10 bg-black/[0.03] p-3 sm:grid-cols-[132px_minmax(0,1fr)] dark:border-white/10 dark:bg-white/[0.04]"
            >
              <button
                type="button"
                className="group relative aspect-video overflow-hidden rounded-md bg-zinc-900"
                onClick={() => openExternal(video.url)}
              >
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : null}
                <span className="absolute inset-0 grid place-items-center bg-black/18">
                  <Play className="h-6 w-6 fill-current text-white" />
                </span>
              </button>
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-semibold">{video.title}</h3>
                <p className="mt-1 truncate text-xs text-muted-foreground">{video.channel}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {video.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="rounded bg-accent/14 px-2 py-1 text-[11px]"
                      onClick={() => onSelectTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openExternal(video.url)}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onRemove(video.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            </article>
          ))}
          {filteredVideos.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-black/20 p-10 text-center dark:border-white/20">
              <p className="font-semibold">No saved videos here yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Save a video from the YouTube queue and give it a tag.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
