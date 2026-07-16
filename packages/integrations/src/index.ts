export type VideoItem = {
  id: string;
  title: string;
  channel: string;
  age: string;
  duration: string;
  status: "new" | "seen" | "saved";
  group: string;
  url: string;
};

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

export const youtubeVideos: VideoItem[] = [
  {
    id: "yt-1",
    title: "Designing a better desktop media hub",
    channel: "Interface Lab",
    age: "18m ago",
    duration: "12:42",
    status: "new",
    group: "Priority",
    url: "https://youtube.com"
  },
  {
    id: "yt-2",
    title: "Steam Deck OLED: one year later",
    channel: "Digital Foundry",
    age: "1h ago",
    duration: "23:08",
    status: "saved",
    group: "Gaming",
    url: "https://youtube.com"
  },
  {
    id: "yt-3",
    title: "React architecture patterns for apps that scale",
    channel: "Frontend Guild",
    age: "3h ago",
    duration: "31:15",
    status: "new",
    group: "Build",
    url: "https://youtube.com"
  },
  {
    id: "yt-4",
    title: "The quiet beauty of useful dashboards",
    channel: "Product Notes",
    age: "Yesterday",
    duration: "9:54",
    status: "seen",
    group: "Design",
    url: "https://youtube.com"
  }
];

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
