import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { redditPosts, youtubeVideos } from "@kickoff/integrations";
import { openExternal } from "@kickoff/platform";
import { Button } from "@kickoff/ui";

type CommandPaletteProps = {
  open: boolean;
  onClose(): void;
  onOpenWidgetLibrary(): void;
  onOpenSettings(): void;
};

export function CommandPalette({
  open,
  onClose,
  onOpenWidgetLibrary,
  onOpenSettings
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const videos = youtubeVideos
      .filter((video) =>
        normalized
          ? `${video.title} ${video.channel} ${video.group}`.toLowerCase().includes(normalized)
          : true
      )
      .slice(0, 3)
      .map((video) => ({
        id: video.id,
        label: video.title,
        description: `YouTube / ${video.channel}`,
        run: () => openExternal(video.url)
      }));

    const posts = redditPosts
      .filter((post) =>
        normalized
          ? `${post.title} ${post.subreddit}`.toLowerCase().includes(normalized)
          : true
      )
      .slice(0, 2)
      .map((post) => ({
        id: post.id,
        label: post.title,
        description: `Reddit / ${post.subreddit}`,
        run: () => openExternal(post.url)
      }));

    const actions = [
      {
        id: "add-widget",
        label: "Add or remove widgets",
        description: "Open the widget library",
        run: onOpenWidgetLibrary
      },
      {
        id: "settings",
        label: "Workspace settings",
        description: "Jump to appearance controls",
        run: onOpenSettings
      }
    ].filter((action) =>
      normalized ? `${action.label} ${action.description}`.toLowerCase().includes(normalized) : true
    );

    return [...actions, ...videos, ...posts];
  }, [onOpenSettings, onOpenWidgetLibrary, query]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/46 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto mt-[8vh] max-w-2xl rounded-lg border border-black/10 bg-card/96 text-card-foreground shadow-panel dark:border-white/12">
        <div className="flex items-center gap-3 border-b border-black/10 p-3 dark:border-white/10">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search videos, posts, or actions"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <Button aria-label="Close search" size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-auto p-2">
          {results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.id}
                type="button"
                className="block w-full rounded-md px-3 py-2 text-left transition hover:bg-black/8 dark:hover:bg-white/10"
                onClick={() => {
                  result.run();
                  onClose();
                }}
              >
                <span className="block text-sm font-medium">{result.label}</span>
                <span className="block text-xs text-muted-foreground">{result.description}</span>
              </button>
            ))
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No matching actions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
