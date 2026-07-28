import { useCallback, useEffect, useState } from "react";
import {
  getYouTubeConnectionState,
  youtubeVideos,
  type VideoItem,
  type YouTubeConnectionState
} from "@kickoff/integrations";
import {
  youtubeBridge,
  type PlatformYouTubeConnectionState,
  type PlatformYouTubeVideosResult
} from "@kickoff/platform";

type YouTubeVideosState = {
  videos: VideoItem[];
  source: "demo" | "connected";
  loading: boolean;
  error?: string;
};

type YouTubeActionState = {
  connecting: boolean;
  disconnecting: boolean;
};

export function useYouTubeConnection() {
  const [connectionState, setConnectionState] = useState<YouTubeConnectionState>(() => getYouTubeConnectionState());
  const [videosState, setVideosState] = useState<YouTubeVideosState>({
    videos: youtubeVideos,
    source: "demo",
    loading: false
  });
  const [actionState, setActionState] = useState<YouTubeActionState>({
    connecting: false,
    disconnecting: false
  });

  const refreshVideos = useCallback(async (forceRefresh = false) => {
    if (!youtubeBridge.isAvailable()) {
      setVideosState({
        videos: youtubeVideos,
        source: "demo",
        loading: false,
        error: "Live YouTube videos are only available in the Kickoff desktop app."
      });
      return;
    }

    setVideosState((current) => ({ ...current, loading: true, error: undefined }));
    const result = await youtubeBridge.getVideos(forceRefresh);
    setVideosState(mapVideosResult(result));
  }, []);

  const refresh = useCallback(async () => {
    if (!youtubeBridge.isAvailable()) {
      setConnectionState({
        status: "demo",
        message: "Open Kickoff in the desktop app to connect YouTube."
      });
      return;
    }

    const status = await youtubeBridge.getStatus();
    const mappedStatus = mapBridgeStatus(status);
    setConnectionState(mappedStatus);
    if (mappedStatus.status === "connected") {
      await refreshVideos();
    }
  }, [refreshVideos]);

  const connect = useCallback(async () => {
    if (!youtubeBridge.isAvailable()) {
      setConnectionState({
        status: "error",
        message: "YouTube connection is only available in the Kickoff desktop app."
      });
      return;
    }

    setActionState((current) => ({ ...current, connecting: true }));
    try {
      setConnectionState({ status: "connecting", message: "Opening Google authorization in your browser." });
      const status = await youtubeBridge.connect();
      const mappedStatus = mapBridgeStatus(status);
      setConnectionState(mappedStatus);
      if (mappedStatus.status === "connected") {
        await refreshVideos();
      }
    } finally {
      setActionState((current) => ({ ...current, connecting: false }));
    }
  }, [refreshVideos]);

  const disconnect = useCallback(async () => {
    setActionState((current) => ({ ...current, disconnecting: true }));
    try {
      const status = await youtubeBridge.disconnect();
      setConnectionState(mapBridgeStatus(status));
      setVideosState({ videos: youtubeVideos, source: "demo", loading: false });
    } finally {
      setActionState((current) => ({ ...current, disconnecting: false }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (connectionState.status !== "connecting") {
      return;
    }

    const interval = window.setInterval(() => {
      refresh();
    }, 2500);

    return () => {
      window.clearInterval(interval);
    };
  }, [connectionState.status, refresh]);

  return {
    connectionState,
    videosState,
    actionState,
    actions: {
      connect,
      disconnect,
      refresh,
      refreshVideos
    }
  };
}

function mapBridgeStatus(status: PlatformYouTubeConnectionState | undefined): YouTubeConnectionState {
  if (!status) {
    return getYouTubeConnectionState();
  }

  if (status.status === "connected") {
    return status;
  }

  return status;
}

function mapVideosResult(result: PlatformYouTubeVideosResult | undefined): YouTubeVideosState {
  if (!result) {
    return {
      videos: youtubeVideos,
      source: "demo",
      loading: false
    };
  }

  if (result.status !== "connected" || result.videos.length === 0) {
    return {
      videos: youtubeVideos,
      source: "demo",
      loading: false,
      error:
        result.status === "error"
          ? result.message
          : "No live uploads were returned yet. Showing the demo queue for now."
    };
  }

  return {
    videos: result.videos,
    source: "connected",
    loading: false
  };
}
