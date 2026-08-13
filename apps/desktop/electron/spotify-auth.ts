import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { shell } from "electron";
import type { SpotifyConnectionState, SpotifyPlaybackResult, SpotifyRecentlyPlayedResult, SpotifyTrack } from "@kickoff/integrations";
import { clearSpotifyTokens, readSpotifyTokens, writeSpotifyTokens, type StoredSpotifyTokens } from "./spotify-token-store";

const CALLBACK_PORT = Number(process.env.SPOTIFY_REDIRECT_PORT || 53683);
const CALLBACK_PATH = "/spotify/oauth/callback";
const REDIRECT_URI = `http://127.0.0.1:${CALLBACK_PORT}${CALLBACK_PATH}`;
const SCOPES = "user-read-private user-read-currently-playing user-read-playback-state user-read-recently-played";
let connecting: Promise<SpotifyConnectionState> | undefined;

export async function getSpotifyAuthStatus(): Promise<SpotifyConnectionState> {
  if (!clientId()) return { status: "disconnected", message: "Add SPOTIFY_CLIENT_ID to connect Spotify.", redirectUri: REDIRECT_URI };
  try {
    const token = await getValidToken();
    if (!token) return { status: "disconnected", redirectUri: REDIRECT_URI };
    const profile = await spotifyFetch<SpotifyProfile>("/me", token);
    return { status: "connected", user: { id: profile.id, name: profile.display_name || profile.id, imageUrl: profile.images?.[0]?.url } };
  } catch (error) {
    return { status: "error", message: message(error), redirectUri: REDIRECT_URI };
  }
}

export function startSpotifyConnect() {
  if (connecting) return connecting;
  connecting = connect().finally(() => { connecting = undefined; });
  return connecting;
}

export async function disconnectSpotify(): Promise<SpotifyConnectionState> {
  await clearSpotifyTokens();
  return { status: "disconnected", message: "Spotify disconnected.", redirectUri: REDIRECT_URI };
}

export async function getSpotifyPlayback(): Promise<SpotifyPlaybackResult> {
  try {
    const token = await getValidToken();
    if (!token) return { status: "error", message: "Connect Spotify to see what is playing." };
    const response = await fetch("https://api.spotify.com/v1/me/player", { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 204) return { status: "connected", playback: { isPlaying: false, progressMs: 0 } };
    if (!response.ok) throw new Error(apiError(response.status));
    const body = await response.json() as SpotifyPlaybackResponse;
    return { status: "connected", playback: { isPlaying: body.is_playing, progressMs: body.progress_ms ?? 0, deviceName: body.device?.name, track: normalizeTrack(body.item) } };
  } catch (error) {
    return { status: "error", message: message(error) };
  }
}

export async function getSpotifyRecentlyPlayed(): Promise<SpotifyRecentlyPlayedResult> {
  try {
    const token = await getValidToken();
    if (!token) return { status: "error", message: "Connect Spotify to see recently played tracks.", tracks: [] };
    const body = await spotifyFetch<SpotifyRecentlyPlayedResponse>("/me/player/recently-played?limit=5", token);
    return {
      status: "connected",
      tracks: body.items.flatMap(({ track, played_at: playedAt }) => {
        const normalized = normalizeTrack(track);
        return normalized ? [{ ...normalized, playedAt }] : [];
      })
    };
  } catch (error) {
    return { status: "error", message: message(error), tracks: [] };
  }
}

async function connect(): Promise<SpotifyConnectionState> {
  const id = clientId();
  if (!id) return { status: "error", message: "Add SPOTIFY_CLIENT_ID before connecting.", redirectUri: REDIRECT_URI };
  const verifier = randomBytes(64).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(24).toString("base64url");
  const callback = waitForCallback(state);
  const url = new URL("https://accounts.spotify.com/authorize");
  url.search = new URLSearchParams({ client_id: id, response_type: "code", redirect_uri: REDIRECT_URI, scope: SCOPES, state, code_challenge_method: "S256", code_challenge: challenge }).toString();
  await shell.openExternal(url.toString());
  try {
    const code = await callback;
    const tokens = await exchangeCode(code, verifier, id);
    await writeSpotifyTokens(tokens);
    return getSpotifyAuthStatus();
  } catch (error) {
    return { status: "error", message: message(error), redirectUri: REDIRECT_URI };
  }
}

function waitForCallback(expectedState: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { server.close(); reject(new Error("Spotify authorization timed out.")); }, 180_000);
    const server = createServer((request, response) => {
      const url = new URL(request.url || "/", REDIRECT_URI);
      if (url.pathname !== CALLBACK_PATH) { response.writeHead(404).end(); return; }
      const finish = (status: number, text: string) => { response.writeHead(status, { "Content-Type": "text/html; charset=utf-8" }); response.end(`<h1>${text}</h1><p>You can close this tab and return to Kickoff.</p>`); clearTimeout(timeout); server.close(); };
      if (url.searchParams.get("state") !== expectedState) { finish(400, "Spotify connection failed"); reject(new Error("Spotify returned an invalid authorization state.")); return; }
      const error = url.searchParams.get("error");
      const code = url.searchParams.get("code");
      if (error || !code) { finish(400, "Spotify connection cancelled"); reject(new Error(error === "access_denied" ? "Spotify authorization was cancelled." : "Spotify did not return an authorization code.")); return; }
      finish(200, "Spotify connected"); resolve(code);
    });
    server.once("error", (error) => { clearTimeout(timeout); reject(new Error(`Could not open Spotify callback on port ${CALLBACK_PORT}: ${message(error)}`)); });
    server.listen(CALLBACK_PORT, "127.0.0.1");
  });
}

async function exchangeCode(code: string, verifier: string, id: string) {
  const response = await fetch("https://accounts.spotify.com/api/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI, client_id: id, code_verifier: verifier }) });
  if (!response.ok) throw new Error(apiError(response.status));
  return mapTokens(await response.json() as TokenResponse);
}

async function getValidToken() {
  const tokens = await readSpotifyTokens();
  if (!tokens) return undefined;
  if (tokens.expiresAt > Date.now() + 60_000) return tokens.accessToken;
  if (!tokens.refreshToken) { await clearSpotifyTokens(); return undefined; }
  const response = await fetch("https://accounts.spotify.com/api/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: tokens.refreshToken, client_id: clientId() }) });
  if (!response.ok) { if (response.status === 400 || response.status === 401) await clearSpotifyTokens(); throw new Error(apiError(response.status)); }
  const refreshed = mapTokens(await response.json() as TokenResponse, tokens.refreshToken);
  await writeSpotifyTokens(refreshed);
  return refreshed.accessToken;
}

async function spotifyFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`https://api.spotify.com/v1${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(apiError(response.status));
  return response.json() as Promise<T>;
}

function mapTokens(value: TokenResponse, priorRefreshToken?: string): StoredSpotifyTokens {
  return { accessToken: value.access_token, refreshToken: value.refresh_token || priorRefreshToken, expiresAt: Date.now() + value.expires_in * 1000, scope: value.scope, tokenType: value.token_type };
}
function normalizeTrack(item?: SpotifyItem | null): SpotifyTrack | undefined {
  if (!item?.id || !item.external_urls?.spotify) return undefined;
  return { id: item.id, title: item.name, artists: item.artists?.map((artist) => artist.name).join(", ") || "Spotify", album: item.album?.name || "", albumArtUrl: item.album?.images?.[0]?.url, url: item.external_urls.spotify, durationMs: item.duration_ms };
}
function clientId() { return process.env.SPOTIFY_CLIENT_ID?.trim() || ""; }
function message(error: unknown) { return error instanceof Error ? error.message : "Kickoff could not connect to Spotify."; }
function apiError(status: number) { if (status === 401) return "Spotify authorization expired. Please reconnect."; if (status === 403) return "Spotify denied access to playback data."; if (status === 429) return "Spotify rate-limited this request. Try again shortly."; return `Spotify request failed (${status}).`; }

type TokenResponse = { access_token: string; refresh_token?: string; expires_in: number; scope?: string; token_type: string };
type SpotifyProfile = { id: string; display_name?: string; images?: Array<{ url: string }> };
type SpotifyItem = { id: string; name: string; duration_ms: number; external_urls?: { spotify?: string }; artists?: Array<{ name: string }>; album?: { name: string; images?: Array<{ url: string }> } };
type SpotifyPlaybackResponse = { is_playing: boolean; progress_ms?: number; device?: { name?: string }; item?: SpotifyItem | null };
type SpotifyRecentlyPlayedResponse = { items: Array<{ track: SpotifyItem; played_at: string }> };
