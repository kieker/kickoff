export type YouTubeVideoStatus = "new" | "seen" | "saved";

export type YouTubeVideoItem = {
  id: string;
  title: string;
  channel: string;
  channelId?: string;
  age: string;
  duration: string;
  status: YouTubeVideoStatus;
  group: string;
  url: string;
  thumbnailUrl?: string;
  publishedAt?: string;
};

export type YouTubeChannelSummary = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  uploadsPlaylistId?: string;
};

export type YouTubeConnectionState =
  | { status: "demo"; message?: string; redirectUri?: string; scope?: string }
  | { status: "disconnected"; message?: string; redirectUri?: string; scope?: string }
  | { status: "connecting"; message?: string; redirectUri?: string; scope?: string }
  | { status: "connected"; message?: string; channel?: YouTubeChannelSummary }
  | { status: "error"; message: string; redirectUri?: string; scope?: string };

export type YouTubeClientConfig = {
  clientId?: string;
  demoMode: boolean;
};
