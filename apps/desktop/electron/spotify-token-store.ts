import { app, safeStorage } from "electron";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredSpotifyTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
  tokenType: string;
};

const TOKEN_FILE = "spotify-tokens.bin";
const tokenDirectory = () => path.join(app.getPath("userData"), "integrations");
const tokenPath = () => path.join(tokenDirectory(), TOKEN_FILE);

export async function readSpotifyTokens(): Promise<StoredSpotifyTokens | undefined> {
  try {
    return JSON.parse(safeStorage.decryptString(await readFile(tokenPath()))) as StoredSpotifyTokens;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return undefined;
    throw error;
  }
}

export async function writeSpotifyTokens(tokens: StoredSpotifyTokens) {
  if (!safeStorage.isEncryptionAvailable()) throw new Error("Secure token storage is not available on this device.");
  await mkdir(tokenDirectory(), { recursive: true });
  await writeFile(tokenPath(), safeStorage.encryptString(JSON.stringify(tokens)));
}

export async function clearSpotifyTokens() {
  await rm(tokenPath(), { force: true });
}
