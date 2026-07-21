import type { YouTubeVideoItem } from "./types";

type YouTubePlaylistItemResource = {
  id: string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    channelId?: string;
    publishedAt?: string;
    resourceId?: {
      videoId?: string;
    };
    thumbnails?: {
      medium?: {
        url?: string;
      };
      high?: {
        url?: string;
      };
    };
  };
};

export function mapPlaylistItemToVideoItem(
  item: YouTubePlaylistItemResource
): YouTubeVideoItem {
  const videoId = item.snippet?.resourceId?.videoId ?? item.id;

  return {
    id: videoId,
    title: item.snippet?.title ?? "Untitled video",
    channel: item.snippet?.channelTitle ?? "Unknown channel",
    channelId: item.snippet?.channelId,
    age: item.snippet?.publishedAt ? "recent" : "unknown",
    duration: "--:--",
    status: "new",
    group: "YouTube",
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.medium?.url,
    publishedAt: item.snippet?.publishedAt
  };
}

