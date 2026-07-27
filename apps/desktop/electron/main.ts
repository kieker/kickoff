import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDesktopEnv } from "./env";
import { disconnectYouTube, getYouTubeAuthStatus, getYouTubeVideos, startYouTubeConnect } from "./youtube-auth";

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
  ipcMain.handle("shell:openExternal", async (_event, url: string) => {
    await shell.openExternal(url);
  });
  ipcMain.handle("youtube:getStatus", () => getYouTubeAuthStatus());
  ipcMain.handle("youtube:connect", () => {
    console.info("[kickoff] Starting YouTube connection flow.");
    return startYouTubeConnect();
  });
  ipcMain.handle("youtube:disconnect", () => disconnectYouTube());
  ipcMain.handle("youtube:getVideos", () => getYouTubeVideos());

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
