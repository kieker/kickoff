import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Loader2, MessageCircle, Settings2, TrendingUp } from "lucide-react";
import { SiReddit } from "react-icons/si";
import { openExternal, type PlatformRedditResult } from "@kickoff/platform";
import { Button } from "@kickoff/ui";
import { WidgetShell } from "../components/widget-shell";
import type { RedditFilter } from "../state/use-dashboard-interactions";

type RedditWidgetProps = {
  filter: RedditFilter;
  communities: string[];
  result: PlatformRedditResult;
  loading: boolean;
  showIcon: boolean;
  onFilterChange(filter: RedditFilter): void;
  onCommunitiesChange(communities: string[]): void;
  onRefresh?: () => void;
  onHide?: () => void;
};

export function RedditWidget({
  filter,
  communities,
  result,
  loading,
  showIcon,
  onFilterChange,
  onCommunitiesChange,
  onRefresh,
  onHide
}: RedditWidgetProps) {
  const [configureOpen, setConfigureOpen] = useState(false);
  const [draft, setDraft] = useState(communities.join(", "));
  useEffect(() => setDraft(communities.join(", ")), [communities]);

  function saveCommunities(event: FormEvent) {
    event.preventDefault();
    onCommunitiesChange(draft.split(/[,+\s]+/));
    setConfigureOpen(false);
  }

  return (
    <WidgetShell
      title="Reddit"
      eyebrow={`${result.status === "live" ? "live" : result.status} / ${communities.length} communities`}
      icon={showIcon ? <SiReddit className="h-5 w-5" /> : undefined}
      onRefresh={onRefresh}
      onHide={onHide}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["hot", "new", "top"] as RedditFilter[]).map((option) => (
          <Button
            key={option}
            size="sm"
            variant={filter === option ? "primary" : "ghost"}
            onClick={() => onFilterChange(option)}
          >
            {option}
          </Button>
        ))}
        <Button className="ml-auto" size="sm" variant="ghost" onClick={() => setConfigureOpen((open) => !open)}>
          <Settings2 className="h-3.5 w-3.5" /> Communities
        </Button>
      </div>

      {configureOpen ? (
        <form onSubmit={saveCommunities} className="mb-3 rounded-md border border-black/10 bg-white/50 p-3 dark:border-white/10 dark:bg-white/8">
          <label className="mb-2 block text-xs font-medium" htmlFor="reddit-communities">Subreddits</label>
          <div className="flex gap-2">
            <input id="reddit-communities" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="youtube, SteamDeck, reactjs" className="min-w-0 flex-1 rounded-md border border-black/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-orange-400 dark:border-white/15 dark:bg-black/20" />
            <Button type="submit" size="sm" variant="primary">Save</Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Separate communities with commas. Do not include full Reddit URLs.</p>
        </form>
      ) : null}

      {loading ? <p className="mb-3 flex items-center text-xs text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading Reddit</p> : null}
      {result.status !== "live" ? (
        <p className={`mb-3 flex items-start rounded-md px-3 py-2 text-xs ${result.status === "error" ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-300"}`}>
          {result.status === "error" ? <AlertCircle className="mr-2 mt-0.5 h-3.5 w-3.5 shrink-0" /> : null}{result.message}
        </p>
      ) : null}

      <div className="space-y-3">
        {!loading && result.posts.length === 0 ? (
          <p className="rounded-md border border-dashed border-black/15 p-4 text-center text-sm text-muted-foreground dark:border-white/15">No posts found for these communities.</p>
        ) : null}
        {result.posts.map((post) => (
          <button
            key={post.id}
            type="button"
            className="block w-full rounded-md border border-black/10 bg-white/46 p-3 text-left transition hover:bg-white/72 dark:border-white/10 dark:bg-black/14 dark:hover:bg-white/10"
            onClick={() => openExternal(post.url)}
          >
            <p className="mb-1 text-[11px] font-medium text-orange-200">r/{post.subreddit}</p>
            <h3 className="line-clamp-2 text-sm font-medium">{post.title}</h3>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {formatCount(post.score)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {formatCount(post.commentCount)}
              </span>
              <span>{formatAge(post.createdAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </WidgetShell>
  );
}

function formatCount(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}k` : String(value);
}

function formatAge(createdAt: string) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
