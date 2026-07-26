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
    getVideos() {
      return ipcRenderer.invoke("youtube:getVideos");
    }
  }
});
