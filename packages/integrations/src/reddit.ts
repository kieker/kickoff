export type RedditSort = "hot" | "new" | "top";

export type RedditPost = {
  id: string;
  subreddit: string;
  title: string;
  score: number;
  commentCount: number;
  createdAt: string;
  url: string;
  author?: string;
  thumbnailUrl?: string;
};

export type RedditFeedResult =
  | { status: "live"; posts: RedditPost[] }
  | { status: "demo"; message: string; posts: RedditPost[] }
  | { status: "error"; message: string; posts: RedditPost[] };

export const defaultRedditCommunities = ["youtube", "SteamDeck", "reactjs"];

export const redditPosts: RedditPost[] = [
  { id: "rd-1", subreddit: "youtube", title: "Creators are experimenting with chapter-first video formats", score: 3200, commentCount: 418, createdAt: new Date(Date.now() - 42 * 60_000).toISOString(), url: "https://reddit.com/r/youtube" },
  { id: "rd-2", subreddit: "SteamDeck", title: "Best compact launchers for a couch dashboard setup?", score: 812, commentCount: 96, createdAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(), url: "https://reddit.com/r/SteamDeck" },
  { id: "rd-3", subreddit: "reactjs", title: "What belongs in shared packages vs app folders?", score: 529, commentCount: 74, createdAt: new Date(Date.now() - 5 * 60 * 60_000).toISOString(), url: "https://reddit.com/r/reactjs" }
];
