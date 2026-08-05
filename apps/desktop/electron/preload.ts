import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("kickoff", {
  shell: {
    openExternal(url: string) {
      ipcRenderer.invoke("shell:openExternal", url);
    }
  },
  steam: {
    getProfile(profileInput: string, forceRefresh?: boolean) {
      return ipcRenderer.invoke("steam:getProfile", profileInput, forceRefresh);
    }
  },
  reddit: {
    getFeed(communities: string[], sort: "hot" | "new" | "top", forceRefresh?: boolean) {
      return ipcRenderer.invoke("reddit:getFeed", communities, sort, forceRefresh);
    }
  },
  youtube: {
    getStatus() {
      return ipcRenderer.invoke("youtube:getStatus");
    },
    connect() {
      return ipcRenderer.invoke("youtube:connect");
    },
    disconnect() {
      return ipcRenderer.invoke("youtube:disconnect");
    },
    getVideos(forceRefresh?: boolean, channelIds?: string[]) {
      return ipcRenderer.invoke("youtube:getVideos", forceRefresh, channelIds);
    },
    getSubscriptions(forceRefresh?: boolean) {
      return ipcRenderer.invoke("youtube:getSubscriptions", forceRefresh);
    },
    getComments(videoId: string, pageToken?: string) {
      return ipcRenderer.invoke("youtube:getComments", videoId, pageToken);
    }
  }
});
