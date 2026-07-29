import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("kickoff", {
  shell: {
    openExternal(url: string) {
      ipcRenderer.invoke("shell:openExternal", url);
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
