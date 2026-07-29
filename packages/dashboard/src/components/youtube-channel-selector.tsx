import { Check, Loader2, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PlatformYouTubeSubscription } from "@kickoff/platform";
import { Button } from "@kickoff/ui";

const MAX_SELECTED_CHANNELS = 24;

type YouTubeChannelSelectorProps = {
  open: boolean;
  subscriptions: PlatformYouTubeSubscription[];
  selectedChannelIds: string[];
  priorityChannelIds: string[];
  loading: boolean;
  error?: string;
  onRefresh(): void;
  onSave(channelIds: string[]): void;
  onClose(): void;
};

export function YouTubeChannelSelector({
  open,
  subscriptions,
  selectedChannelIds,
  priorityChannelIds,
  loading,
  error,
  onRefresh,
  onSave,
  onClose
}: YouTubeChannelSelectorProps) {
  const [query, setQuery] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>(selectedChannelIds);

  useEffect(() => {
    if (open) {
      setDraftIds(selectedChannelIds);
      setQuery("");
      if (subscriptions.length === 0) {
        onRefresh();
      }
    }
  }, [open]);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) {
      return subscriptions;
    }
    return subscriptions.filter((subscription) =>
      subscription.title.toLocaleLowerCase().includes(normalizedQuery)
    );
  }, [query, subscriptions]);

  if (!open) {
    return null;
  }

  const resolvedCount = new Set([...priorityChannelIds, ...draftIds]).size;

  return (
    <div className="fixed inset-0 z-50 bg-black/68 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <section className="mx-auto flex max-h-[calc(100vh-2rem)] max-w-3xl flex-col overflow-hidden rounded-xl border border-white/12 bg-background shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-black/10 p-4 dark:border-white/10">
          <div>
            <h2 className="text-xl font-semibold">Choose YouTube channels</h2>
            <p className="text-sm text-muted-foreground">
              {resolvedCount} of {MAX_SELECTED_CHANNELS} feed channels selected. Priority channels are always included.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
            Close
          </Button>
        </header>

        <div className="flex gap-2 border-b border-black/10 p-4 dark:border-white/10">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-black/10 bg-black/[0.03] px-3 dark:border-white/10 dark:bg-white/[0.04]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
              placeholder="Search subscriptions"
            />
          </label>
          <Button variant="ghost" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
        </div>

        {error ? (
          <p className="mx-4 mt-4 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-100">
            {error}
          </p>
        ) : null}

        <div className="grid gap-2 overflow-y-auto p-4 sm:grid-cols-2">
          {filteredSubscriptions.map((subscription) => {
            const isPriority = priorityChannelIds.includes(subscription.channelId);
            const selected = isPriority || draftIds.includes(subscription.channelId);
            const selectionFull = !selected && resolvedCount >= MAX_SELECTED_CHANNELS;
            return (
              <button
                key={subscription.channelId}
                type="button"
                disabled={isPriority || selectionFull}
                className={
                  selected
                    ? "flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 p-3 text-left"
                    : "flex items-center gap-3 rounded-lg border border-black/10 p-3 text-left hover:bg-black/[0.03] disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/[0.04]"
                }
                onClick={() =>
                  setDraftIds((current) =>
                    current.includes(subscription.channelId)
                      ? current.filter((id) => id !== subscription.channelId)
                      : [...current, subscription.channelId]
                  )
                }
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  {subscription.thumbnailUrl ? (
                    <img src={subscription.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    subscription.title.slice(0, 1)
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{subscription.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {isPriority ? "Priority · always included" : selected ? "Included in feed" : "Not included"}
                  </span>
                </span>
                {selected ? <Check className="h-4 w-4 shrink-0 text-accent" /> : null}
              </button>
            );
          })}
          {loading && subscriptions.length === 0 ? (
            <div className="col-span-full grid place-items-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading subscriptions
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-black/10 p-4 text-xs text-muted-foreground dark:border-white/10">
          <span>Kickoff loads up to three recent uploads from each selected channel.</span>
          <Button
            variant="primary"
            onClick={() => {
              onSave(draftIds);
              onClose();
            }}
          >
            Save channel selection
          </Button>
        </footer>
      </section>
    </div>
  );
}
