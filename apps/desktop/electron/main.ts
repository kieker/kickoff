import { app, BrowserWindow, ipcMain, session, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDesktopEnv } from "./env";
import {
  disconnectYouTube,
  getYouTubeAuthStatus,
  getYouTubeComments,
  getYouTubeSubscriptions,
  getYouTubeVideos,
  startYouTubeConnect
} from "./youtube-auth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadDesktopEnv();
const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;

async function createWindow() {
  const window = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    title: "Kickoff",
    icon: path.join(__dirname, "../assets/kickoff-icon.png"),
    backgroundColor: "#111111",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    await window.loadURL(process.env.VITE_DEV_SERVER_URL as string);
  } else {
    await window.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(async () => {
  session.defaultSession.webRequest.onBeforeSendHeaders(
    {
      urls: ["https://www.youtube.com/*", "https://www.youtube-nocookie.com/*"]
    },
    (details, callback) => {
      callback({
        requestHeaders: {
          ...details.requestHeaders,
          Referer: "https://kickoff.local/"
        }
      });
    }
  );
  ipcMain.handle("shell:openExternal", async (_event, url: string) => {
    await shell.openExternal(url);
  });
  ipcMain.handle("youtube:getStatus", () => getYouTubeAuthStatus());
  ipcMain.handle("youtube:connect", () => {
    console.info("[kickoff] Starting YouTube connection flow.");
    return startYouTubeConnect();
  });
  ipcMain.handle("youtube:disconnect", () => disconnectYouTube());
  ipcMain.handle("youtube:getVideos", (_event, forceRefresh?: boolean, channelIds?: string[]) =>
    getYouTubeVideos(forceRefresh, channelIds)
  );
  ipcMain.handle("youtube:getSubscriptions", (_event, forceRefresh?: boolean) =>
    getYouTubeSubscriptions(forceRefresh)
  );
  ipcMain.handle("youtube:getComments", (_event, videoId: string, pageToken?: string) =>
    getYouTubeComments(videoId, pageToken)
  );

  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
