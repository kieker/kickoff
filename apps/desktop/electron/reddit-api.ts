import { randomUUID } from "node:crypto";
import { redditPosts, type RedditFeedResult, type RedditPost, type RedditSort } from "@kickoff/integrations";

const CACHE_TTL_MS = 2 * 60_000;
const DEFAULT_USER_AGENT = "desktop:kickoff:0.1.0";
const cache = new Map<string, { expiresAt: number; result: RedditFeedResult }>();
let token: { value: string; expiresAt: number } | undefined;
const deviceId = randomUUID();

export async function getRedditFeed(communities: string[], sort: RedditSort, forceRefresh = false): Promise<RedditFeedResult> {
  const normalized = Array.from(new Set(communities.map((value) => value.trim().replace(/^r\//i, "")).filter((value) => /^[A-Za-z0-9_]{2,21}$/.test(value)))).slice(0, 20);
  if (normalized.length === 0) return { status: "error", message: "Add at least one valid subreddit.", posts: [] };
  const clientId = process.env.REDDIT_CLIENT_ID?.trim();
  if (!clientId) return { status: "demo", message: "Add REDDIT_CLIENT_ID to enable live Reddit feeds.", posts: redditPosts };

  const key = `${normalized.join("+").toLowerCase()}:${sort}`;
  const cached = cache.get(key);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.result;

  try {
    const accessToken = await getApplicationToken(clientId);
    const query = new URLSearchParams({ limit: "25", raw_json: "1" });
    if (sort === "top") query.set("t", "day");
    const response = await fetch(`https://oauth.reddit.com/r/${normalized.join("+")}/${sort}?${query}`, { headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": redditUserAgent() } });
    if (!response.ok) throw new Error(redditError(response.status));
    const body = (await response.json()) as RedditListing;
    const result: RedditFeedResult = { status: "live", posts: (body.data?.children ?? []).map(({ data }) => normalizePost(data)) };
    cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, result });
    return result;
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kickoff could not load Reddit.", posts: redditPosts };
  }
}

async function getApplicationToken(clientId: string) {
  if (token && token.expiresAt - 60_000 > Date.now()) return token.value;
  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${clientId}:`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": redditUserAgent() },
    body: new URLSearchParams({ grant_type: "https://oauth.reddit.com/grants/installed_client", device_id: deviceId })
  });
  if (!response.ok) throw new Error(redditError(response.status));
  const result = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!result.access_token) throw new Error("Reddit did not return an access token.");
  token = { value: result.access_token, expiresAt: Date.now() + (result.expires_in ?? 3600) * 1000 };
  return token.value;
}

function redditUserAgent() {
  return process.env.REDDIT_USER_AGENT?.trim() || DEFAULT_USER_AGENT;
}

function redditError(status: number) {
  if (status === 401) return "Reddit rejected the configured client ID.";
  if (status === 403) return "Reddit denied access to this feed.";
  if (status === 429) return "Reddit rate-limited this request. Try again shortly.";
  return `Reddit request failed (${status}).`;
}

function normalizePost(post: RedditApiPost): RedditPost {
  return { id: post.name ?? post.id, subreddit: post.subreddit, title: post.title, score: post.score ?? 0, commentCount: post.num_comments ?? 0, createdAt: new Date(post.created_utc * 1000).toISOString(), url: `https://www.reddit.com${post.permalink}`, author: post.author, thumbnailUrl: post.thumbnail?.startsWith("http") ? post.thumbnail : undefined };
}

type RedditApiPost = { id: string; name?: string; subreddit: string; title: string; score?: number; num_comments?: number; created_utc: number; permalink: string; author?: string; thumbnail?: string };
type RedditListing = { data?: { children?: Array<{ data: RedditApiPost }> } };
