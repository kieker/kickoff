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

export type GameItem = {
  id: string;
  title: string;
  playtime: string;
  lastPlayed: string;
  progress: number;
};

export type RedditPost = {
  id: string;
  subreddit: string;
  title: string;
  score: string;
  comments: string;
  age: string;
  url: string;
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

export const redditPosts: RedditPost[] = [
  {
    id: "rd-1",
    subreddit: "r/youtube",
    title: "Creators are experimenting with chapter-first video formats",
    score: "3.2k",
    comments: "418",
    age: "42m",
    url: "https://reddit.com"
  },
  {
    id: "rd-2",
    subreddit: "r/SteamDeck",
    title: "Best compact launchers for a couch dashboard setup?",
    score: "812",
    comments: "96",
    age: "2h",
    url: "https://reddit.com"
  },
  {
    id: "rd-3",
    subreddit: "r/reactjs",
    title: "What belongs in shared packages vs app folders?",
    score: "529",
    comments: "74",
    age: "5h",
    url: "https://reddit.com"
  }
];
