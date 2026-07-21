import { useEffect, useMemo, useState } from "react";
import { browserStorage } from "@kickoff/platform";
import { defaultWeatherLocation, youtubeVideos } from "@kickoff/integrations";
import type { VideoItem, WeatherLocation } from "@kickoff/integrations";
import type { WidgetId } from "../types";

export type RedditFilter = "hot" | "new" | "top";

export type DashboardInteractions = {
  visibleWidgets: WidgetId[];
  videoStatuses: Record<string, VideoItem["status"]>;
  redditFilter: RedditFilter;
  weatherLocation: WeatherLocation;
  lastRefreshedAt?: string;
};

const storageKey = "kickoff.dashboard.interactions";
const defaultVisibleWidgets: WidgetId[] = ["youtube", "steam", "weather", "reddit", "spotify"];

const defaultInteractions: DashboardInteractions = {
  visibleWidgets: defaultVisibleWidgets,
  videoStatuses: Object.fromEntries(youtubeVideos.map((video) => [video.id, video.status])),
  redditFilter: "hot",
  weatherLocation: defaultWeatherLocation
};

export function useDashboardInteractions() {
  const [state, setState] = useState<DashboardInteractions>(() => {
    const stored = browserStorage.get(storageKey, defaultInteractions);
    return {
      ...defaultInteractions,
      ...stored,
      videoStatuses: {
        ...defaultInteractions.videoStatuses,
        ...stored.videoStatuses
      }
    };
  });

  useEffect(() => {
    browserStorage.set(storageKey, state);
  }, [state]);

  const actions = useMemo(
    () => ({
      toggleWidget(widgetId: WidgetId) {
        setState((current) => {
          const isVisible = current.visibleWidgets.includes(widgetId);
          return {
            ...current,
            visibleWidgets: isVisible
              ? current.visibleWidgets.filter((id) => id !== widgetId)
              : [...current.visibleWidgets, widgetId]
          };
        });
      },
      setRedditFilter(filter: RedditFilter) {
        setState((current) => ({ ...current, redditFilter: filter }));
      },
      setWeatherLocation(location: WeatherLocation) {
        setState((current) => ({ ...current, weatherLocation: location }));
      },
      setVideoStatus(videoId: string, status: VideoItem["status"]) {
        setState((current) => ({
          ...current,
          videoStatuses: {
            ...current.videoStatuses,
            [videoId]: status
          }
        }));
      },
      refresh() {
        setState((current) => ({
          ...current,
          lastRefreshedAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        }));
      }
    }),
    []
  );

  return { state, actions };
}
