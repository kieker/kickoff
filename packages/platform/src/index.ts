export type StorageAdapter = {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
};

export const browserStorage: StorageAdapter = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") {
      return fallback;
    }

    const value = window.localStorage.getItem(key);
    if (!value) {
      return fallback;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(key);
  }
};

export function openExternal(url: string) {
  const shell = window.kickoff?.shell;
  if (shell) {
    shell.openExternal(url);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

export type PlatformYouTubeConnectionState =
  | { status: "demo"; message?: string; redirectUri?: string; scope?: string }
  | { status: "disconnected"; message?: string; redirectUri?: string; scope?: string }
  | { status: "connecting"; message?: string; redirectUri?: string; scope?: string }
  | {
      status: "connected";
      message?: string;
      channel?: {
        id: string;
        title: string;
        description?: string;
        thumbnailUrl?: string;
        uploadsPlaylistId?: string;
      };
    }
  | { status: "error"; message: string; redirectUri?: string; scope?: string };

export type PlatformYouTubeVideoItem = {
  id: string;
  title: string;
  channel: string;
  channelId?: string;
  age: string;
  duration: string;
  status: "new" | "seen" | "saved";
  group: string;
  url: string;
  thumbnailUrl?: string;
  publishedAt?: string;
};

export type PlatformYouTubeVideosResult =
  | { status: "demo"; message: string; videos: PlatformYouTubeVideoItem[] }
  | { status: "connected"; videos: PlatformYouTubeVideoItem[] }
  | { status: "error"; message: string; videos: PlatformYouTubeVideoItem[] };

export type PlatformYouTubeSubscription = {
  channelId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
};

export type PlatformYouTubeSubscriptionsResult =
  | { status: "connected"; subscriptions: PlatformYouTubeSubscription[] }
  | { status: "error"; message: string; subscriptions: PlatformYouTubeSubscription[] };

export type PlatformYouTubeComment = {
  id: string;
  author: string;
  authorAvatarUrl?: string;
  text: string;
  likeCount: number;
  publishedAt?: string;
  replyCount: number;
};

export type PlatformYouTubeCommentsResult =
  | { status: "connected"; comments: PlatformYouTubeComment[]; nextPageToken?: string }
  | { status: "error"; message: string; comments: PlatformYouTubeComment[] };

export const youtubeBridge = {
  isAvailable(): boolean {
    return window.kickoff?.youtube !== undefined;
  },
  async getStatus(): Promise<PlatformYouTubeConnectionState | undefined> {
    return window.kickoff?.youtube?.getStatus();
  },
  async connect(): Promise<PlatformYouTubeConnectionState | undefined> {
    return window.kickoff?.youtube?.connect();
  },
  async disconnect(): Promise<PlatformYouTubeConnectionState | undefined> {
    return window.kickoff?.youtube?.disconnect();
  },
  async getVideos(
    forceRefresh = false,
    channelIds: string[] = []
  ): Promise<PlatformYouTubeVideosResult | undefined> {
    return window.kickoff?.youtube?.getVideos(forceRefresh, channelIds);
  },
  async getSubscriptions(forceRefresh = false): Promise<PlatformYouTubeSubscriptionsResult | undefined> {
    return window.kickoff?.youtube?.getSubscriptions(forceRefresh);
  },
  async getComments(videoId: string, pageToken?: string): Promise<PlatformYouTubeCommentsResult | undefined> {
    return window.kickoff?.youtube?.getComments(videoId, pageToken);
  }
};

declare global {
  interface Window {
    kickoff?: {
      shell: {
        openExternal(url: string): void;
      };
      youtube?: {
        getStatus(): Promise<PlatformYouTubeConnectionState>;
        connect(): Promise<PlatformYouTubeConnectionState>;
        disconnect(): Promise<PlatformYouTubeConnectionState>;
        getVideos(forceRefresh?: boolean, channelIds?: string[]): Promise<PlatformYouTubeVideosResult>;
        getSubscriptions(forceRefresh?: boolean): Promise<PlatformYouTubeSubscriptionsResult>;
        getComments(videoId: string, pageToken?: string): Promise<PlatformYouTubeCommentsResult>;
      };
    };
  }
}
