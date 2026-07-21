import { youtubeVideos } from "./demo-data";
import type { YouTubeClientConfig, YouTubeConnectionState, YouTubeVideoItem } from "./types";

export function getYouTubeClientConfig(): YouTubeClientConfig {
  return {
    clientId: import.meta.env?.VITE_YOUTUBE_CLIENT_ID,
    demoMode: import.meta.env?.VITE_YOUTUBE_DEMO_MODE !== "false"
  };
}

export function getYouTubeConnectionState(): YouTubeConnectionState {
  const config = getYouTubeClientConfig();
  if (config.demoMode || !config.clientId) {
    return { status: "demo" };
  }

  return { status: "disconnected" };
}

export async function getDemoYouTubeVideos(): Promise<YouTubeVideoItem[]> {
  return youtubeVideos;
}

