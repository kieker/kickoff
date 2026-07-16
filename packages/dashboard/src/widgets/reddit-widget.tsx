import { MessageCircle, TrendingUp } from "lucide-react";
import { redditPosts } from "@kickoff/integrations";
import { openExternal } from "@kickoff/platform";
import { Button } from "@kickoff/ui";
import { WidgetShell } from "../components/widget-shell";

export function RedditWidget() {
  return (
    <WidgetShell title="Reddit" eyebrow="hot / saved communities">
      <div className="mb-3 flex gap-2">
        {["hot", "new", "top"].map((filter) => (
          <Button key={filter} size="sm" variant={filter === "hot" ? "primary" : "ghost"}>
            {filter}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {redditPosts.map((post) => (
          <button
            key={post.id}
            type="button"
            className="block w-full rounded-md border border-black/10 bg-white/46 p-3 text-left transition hover:bg-white/72 dark:border-white/10 dark:bg-black/14 dark:hover:bg-white/10"
            onClick={() => openExternal(post.url)}
          >
            <p className="mb-1 text-[11px] font-medium text-orange-200">{post.subreddit}</p>
            <h3 className="line-clamp-2 text-sm font-medium">{post.title}</h3>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {post.score}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {post.comments}
              </span>
              <span>{post.age}</span>
            </div>
          </button>
        ))}
      </div>
    </WidgetShell>
  );
}
