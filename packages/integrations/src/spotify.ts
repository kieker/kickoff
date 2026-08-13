export type SpotifyConnectionState =
  | { status: "disconnected" | "connecting"; message?: string; redirectUri?: string }
  | { status: "connected"; message?: string; user?: { id: string; name: string; imageUrl?: string } }
  | { status: "error"; message: string; redirectUri?: string };

export type SpotifyTrack = {
  id: string;
  title: string;
  artists: string;
  album: string;
  albumArtUrl?: string;
  url: string;
  durationMs: number;
};

export type SpotifyPlayback = {
  isPlaying: boolean;
  progressMs: number;
  deviceName?: string;
  track?: SpotifyTrack;
};

export type SpotifyPlaybackResult =
  | { status: "connected"; playback: SpotifyPlayback }
  | { status: "error"; message: string };

export type SpotifyRecentTrack = SpotifyTrack & { playedAt: string };

export type SpotifyRecentlyPlayedResult =
  | { status: "connected"; tracks: SpotifyRecentTrack[] }
  | { status: "error"; message: string; tracks: SpotifyRecentTrack[] };
