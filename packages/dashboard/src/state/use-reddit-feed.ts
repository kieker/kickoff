import { useCallback, useEffect, useState } from "react";
import { defaultRedditCommunities, redditPosts, type RedditSort } from "@kickoff/integrations";
import { browserStorage, redditBridge, type PlatformRedditResult } from "@kickoff/platform";

const STORAGE_KEY = "kickoff.profile.default.integrations.reddit.v1";

export function useRedditFeed(sort: RedditSort) {
  const [communities, setCommunitiesState] = useState<string[]>(() => browserStorage.get(STORAGE_KEY, defaultRedditCommunities));
  const [result, setResult] = useState<PlatformRedditResult>({ status: "demo", message: "Loading Reddit…", posts: redditPosts });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (forceRefresh = false, values = communities, selectedSort = sort) => {
    setLoading(true);
    try {
      const next = await redditBridge.getFeed(values, selectedSort, forceRefresh);
      setResult(next ?? { status: "demo", message: "Live Reddit is available in the desktop app.", posts: redditPosts });
    } finally {
      setLoading(false);
    }
  }, [communities, sort]);

  useEffect(() => { void load(false); }, [load]);

  function setCommunities(values: string[]) {
    const normalized = Array.from(new Set(values.map((value) => value.trim().replace(/^r\//i, "")).filter((value) => /^[A-Za-z0-9_]{2,21}$/.test(value)))).slice(0, 20);
    if (normalized.length === 0) return;
    browserStorage.set(STORAGE_KEY, normalized);
    setCommunitiesState(normalized);
  }

  return { communities, setCommunities, result, loading, load };
}
