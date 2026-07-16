import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("kickoff", {
  shell: {
    openExternal(url: string) {
      ipcRenderer.invoke("shell:openExternal", url);
    }
  }
});
