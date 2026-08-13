import { useCallback, useEffect, useState } from "react";
import { spotifyBridge, type PlatformSpotifyConnectionState, type PlatformSpotifyPlaybackResult, type PlatformSpotifyRecentlyPlayedResult } from "@kickoff/platform";

const unavailable: PlatformSpotifyConnectionState = { status: "disconnected", message: "Open Kickoff in the desktop app to connect Spotify." };

export function useSpotifyConnection() {
  const [connection, setConnection] = useState<PlatformSpotifyConnectionState>(unavailable);
  const [playback, setPlayback] = useState<PlatformSpotifyPlaybackResult>();
  const [recentlyPlayed, setRecentlyPlayed] = useState<PlatformSpotifyRecentlyPlayedResult>();
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!spotifyBridge.isAvailable()) { setConnection(unavailable); return; }
    setLoading(true);
    try {
      const status = await spotifyBridge.getStatus();
      if (status) setConnection(status);
      if (status?.status === "connected") {
        const [nextPlayback, nextRecentlyPlayed] = await Promise.all([spotifyBridge.getPlayback(), spotifyBridge.getRecentlyPlayed()]);
        setPlayback(nextPlayback);
        setRecentlyPlayed(nextRecentlyPlayed);
      } else { setPlayback(undefined); setRecentlyPlayed(undefined); }
    } finally { setLoading(false); }
  }, []);

  const connect = useCallback(async () => {
    if (!spotifyBridge.isAvailable()) { setConnection(unavailable); return; }
    setLoading(true);
    setConnection({ status: "connecting", message: "Complete Spotify authorization in your browser." });
    try {
      const status = await spotifyBridge.connect();
      if (status) setConnection(status);
      if (status?.status === "connected") {
        const [nextPlayback, nextRecentlyPlayed] = await Promise.all([spotifyBridge.getPlayback(), spotifyBridge.getRecentlyPlayed()]);
        setPlayback(nextPlayback);
        setRecentlyPlayed(nextRecentlyPlayed);
      }
    } finally { setLoading(false); }
  }, []);

  const disconnect = useCallback(async () => {
    setLoading(true);
    try { const status = await spotifyBridge.disconnect(); if (status) setConnection(status); setPlayback(undefined); setRecentlyPlayed(undefined); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (connection.status !== "connected") return;
    const timer = window.setInterval(() => { void refresh(); }, 30_000);
    return () => window.clearInterval(timer);
  }, [connection.status, refresh]);

  return { connection, playback, recentlyPlayed, loading, connect, disconnect, refresh };
}
