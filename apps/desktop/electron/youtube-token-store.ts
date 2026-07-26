import { app, safeStorage } from "electron";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredYouTubeTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
  tokenType: string;
};

const TOKEN_FILE = "youtube-tokens.bin";

export async function readYouTubeTokens(): Promise<StoredYouTubeTokens | undefined> {
  try {
    const encryptedTokens = await readFile(getTokenPath());
    const tokenJson = safeStorage.decryptString(encryptedTokens);
    return JSON.parse(tokenJson) as StoredYouTubeTokens;
  } catch (error) {
    if (isMissingFileError(error)) {
      return undefined;
    }

    throw error;
  }
}

export async function writeYouTubeTokens(tokens: StoredYouTubeTokens) {
  assertSecureStorageAvailable();
  await mkdir(getTokenDirectory(), { recursive: true });
  await writeFile(getTokenPath(), safeStorage.encryptString(JSON.stringify(tokens)));
}

export async function clearYouTubeTokens() {
  await rm(getTokenPath(), { force: true });
}

function getTokenDirectory() {
  return path.join(app.getPath("userData"), "integrations");
}

function getTokenPath() {
  return path.join(getTokenDirectory(), TOKEN_FILE);
}

function assertSecureStorageAvailable() {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("Secure token storage is not available on this device.");
  }
}

function isMissingFileError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
