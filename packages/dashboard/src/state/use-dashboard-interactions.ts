import { useEffect, useMemo, useState } from "react";
import { browserStorage } from "@kickoff/platform";
import { defaultWeatherLocation, youtubeVideos } from "@kickoff/integrations";
import type { VideoItem, WeatherLocation } from "@kickoff/integrations";
import type { WidgetId } from "../types";

export type RedditFilter = "hot" | "new" | "top";
export type SavedVideo = VideoItem & {
  tags: string[];
  savedAt: string;
};
export type VideoProgress = {
  seconds: number;
  duration: number;
  updatedAt: string;
  completed?: boolean;
};

export type DashboardInteractions = {
  visibleWidgets: WidgetId[];
  widgetLayout: Partial<Record<WidgetId, WidgetLayout>>;
  videoStatuses: Record<string, VideoItem["status"]>;
  savedVideos: Record<string, SavedVideo>;
  videoProgress: Record<string, VideoProgress>;
  priorityChannelIds: string[];
  selectedYouTubeChannelIds: string[];
  redditFilter: RedditFilter;
  weatherLocation: WeatherLocation;
  lastRefreshedAt?: string;
};

export type WidgetLayout = {
  columnSpan: number;
  height?: number;
  collapsed: boolean;
};

const storageKey = "kickoff.dashboard.interactions";
const defaultVisibleWidgets: WidgetId[] = ["youtube", "steam", "weather", "reddit", "spotify"];

const defaultInteractions: DashboardInteractions = {
  visibleWidgets: defaultVisibleWidgets,
  widgetLayout: {
    youtube: { columnSpan: 2, collapsed: false },
    steam: { columnSpan: 1, collapsed: false },
    weather: { columnSpan: 1, collapsed: false },
    reddit: { columnSpan: 1, collapsed: false },
    spotify: { columnSpan: 1, collapsed: false }
  },
  videoStatuses: Object.fromEntries(youtubeVideos.map((video) => [video.id, video.status])),
  savedVideos: {},
  videoProgress: {},
  priorityChannelIds: [],
  selectedYouTubeChannelIds: [],
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
      },
      savedVideos: stored.savedVideos ?? {},
      videoProgress: stored.videoProgress ?? {},
      priorityChannelIds: stored.priorityChannelIds ?? [],
      selectedYouTubeChannelIds: stored.selectedYouTubeChannelIds ?? [],
      widgetLayout: {
        ...defaultInteractions.widgetLayout,
        ...(stored.widgetLayout ?? {})
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
      moveWidget(widgetId: WidgetId, targetId: WidgetId) {
        if (widgetId === targetId) return;
        setState((current) => {
          const next = [...current.visibleWidgets];
          const from = next.indexOf(widgetId);
          const to = next.indexOf(targetId);
          if (from < 0 || to < 0) return current;
          next.splice(from, 1);
          next.splice(to, 0, widgetId);
          return { ...current, visibleWidgets: next };
        });
      },
      updateWidgetLayout(widgetId: WidgetId, layout: Partial<WidgetLayout>) {
        setState((current) => ({
          ...current,
          widgetLayout: {
            ...current.widgetLayout,
            [widgetId]: {
              columnSpan: current.widgetLayout[widgetId]?.columnSpan ?? 1,
              collapsed: current.widgetLayout[widgetId]?.collapsed ?? false,
              ...current.widgetLayout[widgetId],
              ...layout
            }
          }
        }));
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
      saveVideo(video: VideoItem, tags: string[]) {
        const normalizedTags = Array.from(
          new Set(tags.map((tag) => tag.trim()).filter(Boolean))
        );
        setState((current) => ({
          ...current,
          videoStatuses: {
            ...current.videoStatuses,
            [video.id]: "saved"
          },
          savedVideos: {
            ...current.savedVideos,
            [video.id]: {
              ...video,
              status: "saved",
              tags: normalizedTags.length > 0 ? normalizedTags : ["Watch later"],
              savedAt: current.savedVideos[video.id]?.savedAt ?? new Date().toISOString()
            }
          }
        }));
      },
      removeSavedVideo(videoId: string) {
        setState((current) => {
          const savedVideos = { ...current.savedVideos };
          delete savedVideos[videoId];
          return {
            ...current,
            savedVideos,
            videoStatuses: {
              ...current.videoStatuses,
              [videoId]: "new"
            }
          };
        });
      },
      setVideoProgress(videoId: string, seconds: number, duration: number) {
        if (!Number.isFinite(seconds) || !Number.isFinite(duration) || duration <= 0) {
          return;
        }
        setState((current) => ({
          ...current,
          videoProgress: {
            ...current.videoProgress,
            [videoId]: {
              seconds: Math.max(0, Math.min(seconds, duration)),
              duration,
              updatedAt: new Date().toISOString(),
              completed: current.videoProgress[videoId]?.completed
            }
          }
        }));
      },
      completeVideo(videoId: string, duration: number) {
        setState((current) => ({
          ...current,
          videoStatuses: current.savedVideos[videoId]
            ? current.videoStatuses
            : { ...current.videoStatuses, [videoId]: "seen" },
          videoProgress: {
            ...current.videoProgress,
            [videoId]: {
              seconds: duration,
              duration,
              updatedAt: new Date().toISOString(),
              completed: true
            }
          }
        }));
      },
      togglePriorityChannel(channelId: string) {
        setState((current) => ({
          ...current,
          priorityChannelIds: current.priorityChannelIds.includes(channelId)
            ? current.priorityChannelIds.filter((id) => id !== channelId)
            : [...current.priorityChannelIds, channelId]
        }));
      },
      setSelectedYouTubeChannels(channelIds: string[]) {
        setState((current) => ({
          ...current,
          selectedYouTubeChannelIds: Array.from(new Set(channelIds))
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
