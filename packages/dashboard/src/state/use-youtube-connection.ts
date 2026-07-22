import { useCallback, useEffect, useState } from "react";
import { getYouTubeConnectionState, type YouTubeConnectionState } from "@kickoff/integrations";
import { youtubeBridge, type PlatformYouTubeConnectionState } from "@kickoff/platform";

export function useYouTubeConnection() {
  const [connectionState, setConnectionState] = useState<YouTubeConnectionState>(() => getYouTubeConnectionState());

  const refresh = useCallback(async () => {
    const status = await youtubeBridge.getStatus();
    setConnectionState(mapBridgeStatus(status));
  }, []);

  const connect = useCallback(async () => {
    setConnectionState({ status: "connecting", message: "Opening Google authorization in your browser." });
    const status = await youtubeBridge.connect();
    setConnectionState(mapBridgeStatus(status));
  }, []);

  const disconnect = useCallback(async () => {
    const status = await youtubeBridge.disconnect();
    setConnectionState(mapBridgeStatus(status));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    connectionState,
    actions: {
      connect,
      disconnect,
      refresh
    }
  };
}

function mapBridgeStatus(status: PlatformYouTubeConnectionState | undefined): YouTubeConnectionState {
  if (!status) {
    return getYouTubeConnectionState();
  }

  if (status.status === "connected") {
    return {
      status: "error",
      message: "Connected account metadata is not available yet."
    };
  }

  return status;
}
