export { getDemoYouTubeVideos, getYouTubeClientConfig, getYouTubeConnectionState } from "./youtube";
export { youtubeVideos } from "./youtube";
export type { YouTubeVideoItem as VideoItem } from "./youtube";
export type {
  YouTubeChannelSummary,
  YouTubeClientConfig,
  YouTubeConnectionState,
  YouTubeVideoItem,
  YouTubeVideoStatus
} from "./youtube";
export { defaultRedditCommunities, redditPosts } from "./reddit";
export type { RedditFeedResult, RedditPost, RedditSort } from "./reddit";

export type GameItem = {
  id: string;
  title: string;
  playtime: string;
  lastPlayed: string;
  progress: number;
};


export {
  defaultWeatherLocation,
  describeWeatherCode,
  fetchWeatherForecast,
  searchWeatherLocations
} from "./weather";
export type { WeatherForecast, WeatherLocation } from "./weather";

export const steamGames: GameItem[] = [
  {
    id: "steam-1",
    title: "Hades II",
    playtime: "38h",
    lastPlayed: "Yesterday",
    progress: 72
  },
  {
    id: "steam-2",
    title: "Balatro",
    playtime: "64h",
    lastPlayed: "2 days ago",
    progress: 54
  },
  {
    id: "steam-3",
    title: "Cyberpunk 2077",
    playtime: "121h",
    lastPlayed: "Last week",
    progress: 88
  }
];
