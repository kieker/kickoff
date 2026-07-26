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

export function useYouTubeConnection() {
  const [connectionState, setConnectionState] = useState<YouTubeConnectionState>(() => getYouTubeConnectionState());
  const [videosState, setVideosState] = useState<YouTubeVideosState>({
    videos: youtubeVideos,
    source: "demo",
    loading: false
  });

  const refresh = useCallback(async () => {
    const status = await youtubeBridge.getStatus();
    const mappedStatus = mapBridgeStatus(status);
    setConnectionState(mappedStatus);
    if (mappedStatus.status === "connected") {
      await refreshVideos();
    }
  }, []);

  const connect = useCallback(async () => {
    setConnectionState({ status: "connecting", message: "Opening Google authorization in your browser." });
    const status = await youtubeBridge.connect();
    setConnectionState(mapBridgeStatus(status));
  }, []);

  const disconnect = useCallback(async () => {
    const status = await youtubeBridge.disconnect();
    setConnectionState(mapBridgeStatus(status));
    setVideosState({ videos: youtubeVideos, source: "demo", loading: false });
  }, []);

  const refreshVideos = useCallback(async () => {
    setVideosState((current) => ({ ...current, loading: true, error: undefined }));
    const result = await youtubeBridge.getVideos();
    setVideosState(mapVideosResult(result));
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
      error: result.status === "error" ? result.message : undefined
    };
  }

  return {
    videos: result.videos,
    source: "connected",
    loading: false
  };
}
