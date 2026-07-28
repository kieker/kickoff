import { shell } from "electron";
import crypto from "node:crypto";
import http from "node:http";
import { URL } from "node:url";
import {
  clearYouTubeTokens,
  readYouTubeTokens,
  writeYouTubeTokens,
  type StoredYouTubeTokens
} from "./youtube-token-store";

const YOUTUBE_SCOPE = "https://www.googleapis.com/auth/youtube.readonly";
const DEFAULT_REDIRECT_PORT = 53682;
const CALLBACK_PATH = "/youtube/oauth/callback";

export type ElectronYouTubeConnectionState =
  | { status: "demo"; message: string; redirectUri: string; scope: string }
  | { status: "disconnected"; message?: string; redirectUri: string; scope: string }
  | { status: "connecting"; message: string; redirectUri: string; scope: string }
  | { status: "connected"; message: string; channel?: ElectronYouTubeChannelSummary }
  | { status: "error"; message: string; redirectUri?: string; scope?: string };

export type ElectronYouTubeVideosResult =
  | { status: "demo"; message: string; videos: ElectronYouTubeVideoItem[] }
  | { status: "connected"; videos: ElectronYouTubeVideoItem[] }
  | { status: "error"; message: string; videos: ElectronYouTubeVideoItem[] };

type ElectronYouTubeChannelSummary = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  uploadsPlaylistId?: string;
};

type ElectronYouTubeVideoItem = {
  id: string;
  title: string;
  channel: string;
  channelId?: string;
  age: string;
  duration: string;
  status: "new" | "seen" | "saved";
  group: string;
  url: string;
  thumbnailUrl?: string;
  publishedAt?: string;
};

type PendingAuth = {
  server: http.Server;
  state: string;
  verifier: string;
};

let pendingAuth: PendingAuth | undefined;
let currentStatus: ElectronYouTubeConnectionState | undefined;
let cachedSubscriptionFeed:
  | { accessToken: string; expiresAt: number; videos: ElectronYouTubeVideoItem[] }
  | undefined;

const SUBSCRIPTION_FEED_TTL_MS = 10 * 60_000;
const MAX_SUBSCRIPTIONS = 12;
const UPLOADS_PER_CHANNEL = 3;
const MAX_FEED_VIDEOS = 18;

export async function getYouTubeAuthStatus(): Promise<ElectronYouTubeConnectionState> {
  if (pendingAuth && currentStatus?.status === "connecting") {
    return currentStatus;
  }

  const config = getYouTubeAuthConfig();
  if (!config.clientId) {
    return {
      status: "demo",
      message: "Add YOUTUBE_CLIENT_ID to enable account connection.",
      redirectUri: config.redirectUri,
      scope: YOUTUBE_SCOPE
    };
  }

  const storedTokens = await readYouTubeTokens();
  if (!storedTokens) {
    return {
      status: "disconnected",
      redirectUri: config.redirectUri,
      scope: YOUTUBE_SCOPE
    };
  }

  try {
    const tokens = await ensureFreshTokens(storedTokens, config.clientId);
    currentStatus = await getConnectedStatus(tokens);
    return currentStatus;
  } catch (error) {
    currentStatus = {
      status: "error",
      message: error instanceof Error ? error.message : "Could not read the YouTube connection.",
      redirectUri: config.redirectUri,
      scope: YOUTUBE_SCOPE
    };
    return currentStatus;
  }
}

export async function startYouTubeConnect(): Promise<ElectronYouTubeConnectionState> {
  cleanupPendingAuth();

  const config = getYouTubeAuthConfig();
  if (!config.clientId) {
    currentStatus = {
      status: "demo",
      message: "Add YOUTUBE_CLIENT_ID to enable account connection.",
      redirectUri: config.redirectUri,
      scope: YOUTUBE_SCOPE
    };
    return currentStatus;
  }

  const verifier = base64Url(crypto.randomBytes(64));
  const challenge = base64Url(crypto.createHash("sha256").update(verifier).digest());
  const state = base64Url(crypto.randomBytes(32));

  try {
    const server = await createCallbackServer({
      redirectUri: config.redirectUri,
      state,
      verifier
    });

    pendingAuth = { server, state, verifier };
    currentStatus = {
      status: "connecting",
      message: "Waiting for Google authorization in your browser.",
      redirectUri: config.redirectUri,
      scope: YOUTUBE_SCOPE
    };

    await shell.openExternal(
      buildAuthorizationUrl({
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        challenge,
        state
      })
    );
    return currentStatus;
  } catch (error) {
    cleanupPendingAuth();
    currentStatus = {
      status: "error",
      message: error instanceof Error ? error.message : "Could not start YouTube authorization.",
      redirectUri: config.redirectUri,
      scope: YOUTUBE_SCOPE
    };
    return currentStatus;
  }
}

export async function getYouTubeVideos(forceRefresh = false): Promise<ElectronYouTubeVideosResult> {
  const config = getYouTubeAuthConfig();
  if (!config.clientId) {
    return {
      status: "demo",
      message: "Add YOUTUBE_CLIENT_ID to enable live YouTube videos.",
      videos: []
    };
  }

  try {
    const storedTokens = await readYouTubeTokens();
    if (!storedTokens) {
      return {
        status: "demo",
        message: "Connect YouTube to load live videos.",
        videos: []
      };
    }

    const tokens = await ensureFreshTokens(storedTokens, config.clientId);
    if (
      !forceRefresh &&
      cachedSubscriptionFeed &&
      cachedSubscriptionFeed.accessToken === tokens.accessToken &&
      cachedSubscriptionFeed.expiresAt > Date.now()
    ) {
      return { status: "connected", videos: cachedSubscriptionFeed.videos };
    }

    const videos = await fetchSubscriptionFeed(tokens.accessToken);
    cachedSubscriptionFeed = {
      accessToken: tokens.accessToken,
      expiresAt: Date.now() + SUBSCRIPTION_FEED_TTL_MS,
      videos
    };
    return {
      status: "connected",
      videos
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kickoff could not load YouTube videos.",
      videos: []
    };
  }
}

export async function disconnectYouTube(): Promise<ElectronYouTubeConnectionState> {
  cleanupPendingAuth();
  cachedSubscriptionFeed = undefined;
  await clearYouTubeTokens();
  const config = getYouTubeAuthConfig();
  const status: ElectronYouTubeConnectionState = {
    status: config.clientId ? "disconnected" : "demo",
    message: config.clientId ? "YouTube is disconnected." : "Add YOUTUBE_CLIENT_ID to enable account connection.",
    redirectUri: config.redirectUri,
    scope: YOUTUBE_SCOPE
  };
  currentStatus = status;
  return status;
}

function getYouTubeAuthConfig() {
  const port = Number.parseInt(process.env.YOUTUBE_REDIRECT_PORT ?? "", 10) || DEFAULT_REDIRECT_PORT;
  return {
    clientId: process.env.YOUTUBE_CLIENT_ID || process.env.VITE_YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri: `http://127.0.0.1:${port}${CALLBACK_PATH}`
  };
}

function buildAuthorizationUrl({
  clientId,
  redirectUri,
  challenge,
  state
}: {
  clientId: string;
  redirectUri: string;
  challenge: string;
  state: string;
}) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", YOUTUBE_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);
  return url.toString();
}

function createCallbackServer({
  redirectUri,
  state,
  verifier
}: {
  redirectUri: string;
  state: string;
  verifier: string;
}) {
  const callbackUrl = new URL(redirectUri);

  return new Promise<http.Server>((resolve, reject) => {
    const server = http.createServer(async (request, response) => {
      if (!request.url) {
        sendCallbackResponse(response, 400, "Kickoff could not read the authorization callback.");
        return;
      }

      const requestUrl = new URL(request.url, redirectUri);
      if (requestUrl.pathname !== CALLBACK_PATH) {
        sendCallbackResponse(response, 404, "Kickoff did not recognize this authorization path.");
        return;
      }

      const returnedState = requestUrl.searchParams.get("state");
      const code = requestUrl.searchParams.get("code");
      const error = requestUrl.searchParams.get("error");

      if (error) {
        currentStatus = {
          status: "error",
          message: `Google authorization was cancelled or failed: ${error}`,
          redirectUri,
          scope: YOUTUBE_SCOPE
        };
        sendCallbackResponse(response, 400, "Authorization was cancelled or failed. You can close this tab.");
        cleanupPendingAuth();
        return;
      }

      if (!code || returnedState !== state) {
        currentStatus = {
          status: "error",
          message: "The YouTube authorization callback was invalid.",
          redirectUri,
          scope: YOUTUBE_SCOPE
        };
        sendCallbackResponse(response, 400, "Kickoff could not validate this authorization callback.");
        cleanupPendingAuth();
        return;
      }

      try {
        const tokens = await exchangeAuthorizationCode({ code, redirectUri, verifier });
        await writeYouTubeTokens(tokens);
        currentStatus = await getConnectedStatus(tokens);
        sendCallbackResponse(response, 200, "Kickoff connected YouTube. You can close this tab and return to the app.");
      } catch (exchangeError) {
        const message =
          exchangeError instanceof Error ? exchangeError.message : "Kickoff could not finish YouTube authorization.";
        console.error("[kickoff] YouTube authorization failed:", message);
        currentStatus = {
          status: "error",
          message,
          redirectUri,
          scope: YOUTUBE_SCOPE
        };
        sendCallbackResponse(response, 500, `Kickoff could not finish YouTube authorization: ${message}`);
      } finally {
        cleanupPendingAuth();
      }
    });

    server.once("error", (error) => {
      reject(error);
    });

    server.listen(Number(callbackUrl.port), callbackUrl.hostname, () => {
      resolve(server);
    });
  });
}

async function exchangeAuthorizationCode({
  code,
  redirectUri,
  verifier
}: {
  code: string;
  redirectUri: string;
  verifier: string;
}): Promise<StoredYouTubeTokens> {
  const config = getYouTubeAuthConfig();
  if (!config.clientId) {
    throw new Error("YOUTUBE_CLIENT_ID is required to finish YouTube authorization.");
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    code,
    code_verifier: verifier,
    grant_type: "authorization_code",
    redirect_uri: redirectUri
  });
  if (config.clientSecret) {
    params.set("client_secret", config.clientSecret);
  }
  const tokenResponse = await postGoogleTokenRequest(params);

  if (!tokenResponse.access_token) {
    throw new Error("Google did not return a YouTube access token.");
  }

  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: Date.now() + (tokenResponse.expires_in ?? 3600) * 1000,
    scope: tokenResponse.scope,
    tokenType: tokenResponse.token_type ?? "Bearer"
  };
}

async function ensureFreshTokens(tokens: StoredYouTubeTokens, clientId: string): Promise<StoredYouTubeTokens> {
  if (tokens.expiresAt > Date.now() + 60_000) {
    return tokens;
  }

  if (!tokens.refreshToken) {
    throw new Error("The YouTube session expired. Reconnect your account.");
  }

  const refreshParams = new URLSearchParams({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: tokens.refreshToken
  });
  const config = getYouTubeAuthConfig();
  if (config.clientSecret) {
    refreshParams.set("client_secret", config.clientSecret);
  }

  const tokenResponse = await postGoogleTokenRequest(refreshParams);

  if (!tokenResponse.access_token) {
    throw new Error("Google did not return a refreshed YouTube access token.");
  }

  const refreshedTokens: StoredYouTubeTokens = {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token ?? tokens.refreshToken,
    expiresAt: Date.now() + (tokenResponse.expires_in ?? 3600) * 1000,
    scope: tokenResponse.scope ?? tokens.scope,
    tokenType: tokenResponse.token_type ?? tokens.tokenType
  };
  await writeYouTubeTokens(refreshedTokens);
  return refreshedTokens;
}

async function getConnectedStatus(tokens: StoredYouTubeTokens): Promise<ElectronYouTubeConnectionState> {
  try {
    const channel = await fetchConnectedChannel(tokens.accessToken);
    return {
      status: "connected",
      message: `Signed in as ${channel.title}.`,
      channel
    };
  } catch {
    return {
      status: "connected",
      message: "YouTube is connected. Channel details will refresh when the API is available."
    };
  }
}

async function fetchConnectedChannel(accessToken: string): Promise<ElectronYouTubeChannelSummary> {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("mine", "true");

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`YouTube channel lookup failed with ${response.status}.`);
  }

  const body = (await response.json()) as YouTubeChannelsResponse;
  const channel = body.items?.[0];
  if (!channel) {
    throw new Error("No YouTube channel was returned for this account.");
  }

  return {
    id: channel.id,
    title: channel.snippet?.title ?? "YouTube account",
    description: channel.snippet?.description,
    thumbnailUrl: channel.snippet?.thumbnails?.default?.url ?? channel.snippet?.thumbnails?.medium?.url,
    uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads
  };
}

async function fetchUploadsPlaylistVideos(accessToken: string, playlistId: string): Promise<ElectronYouTubeVideoItem[]> {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("playlistId", playlistId);
  url.searchParams.set("maxResults", String(UPLOADS_PER_CHANNEL));

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });

  await assertYouTubeResponse(response, "uploads lookup");

  const body = (await response.json()) as YouTubePlaylistItemsResponse;
  return (body.items ?? [])
    .map(mapPlaylistItemToVideoItem)
    .filter((video): video is ElectronYouTubeVideoItem => video !== undefined);
}

async function fetchSubscriptionFeed(accessToken: string): Promise<ElectronYouTubeVideoItem[]> {
  const subscriptionsUrl = new URL("https://www.googleapis.com/youtube/v3/subscriptions");
  subscriptionsUrl.searchParams.set("part", "snippet");
  subscriptionsUrl.searchParams.set("mine", "true");
  subscriptionsUrl.searchParams.set("order", "relevance");
  subscriptionsUrl.searchParams.set("maxResults", String(MAX_SUBSCRIPTIONS));

  const subscriptionsResponse = await fetch(subscriptionsUrl, {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  await assertYouTubeResponse(subscriptionsResponse, "subscriptions lookup");
  const subscriptions = (await subscriptionsResponse.json()) as YouTubeSubscriptionsResponse;
  const channelIds = (subscriptions.items ?? [])
    .map((item) => item.snippet?.resourceId?.channelId)
    .filter((channelId): channelId is string => Boolean(channelId));

  if (channelIds.length === 0) {
    return [];
  }

  const channelsUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
  channelsUrl.searchParams.set("part", "contentDetails");
  channelsUrl.searchParams.set("id", channelIds.join(","));
  channelsUrl.searchParams.set("maxResults", String(MAX_SUBSCRIPTIONS));
  const channelsResponse = await fetch(channelsUrl, {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  await assertYouTubeResponse(channelsResponse, "subscription channels lookup");
  const channels = (await channelsResponse.json()) as YouTubeChannelsResponse;
  const playlistIds = (channels.items ?? [])
    .map((channel) => channel.contentDetails?.relatedPlaylists?.uploads)
    .filter((playlistId): playlistId is string => Boolean(playlistId));

  const batches = await Promise.allSettled(
    playlistIds.map((playlistId) => fetchUploadsPlaylistVideos(accessToken, playlistId))
  );
  const videos = batches.flatMap((batch) => (batch.status === "fulfilled" ? batch.value : []));
  if (videos.length === 0 && batches.some((batch) => batch.status === "rejected")) {
    const failure = batches.find((batch): batch is PromiseRejectedResult => batch.status === "rejected");
    throw failure?.reason instanceof Error ? failure.reason : new Error("YouTube could not load subscription uploads.");
  }

  return videos
    .sort((left, right) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? ""))
    .slice(0, MAX_FEED_VIDEOS);
}

async function assertYouTubeResponse(response: Response, operation: string) {
  if (response.ok) {
    return;
  }

  let reason = "";
  try {
    const body = (await response.clone().json()) as YouTubeErrorResponse;
    reason = body.error?.errors?.[0]?.reason ?? "";
  } catch {
    // The HTTP status still provides a useful fallback message.
  }

  if (response.status === 403 && ["quotaExceeded", "dailyLimitExceeded"].includes(reason)) {
    throw new Error("YouTube quota is currently exhausted. Kickoff will keep your local queue and try again later.");
  }
  throw new Error(`YouTube ${operation} failed with ${response.status}.`);
}

async function postGoogleTokenRequest(params: URLSearchParams): Promise<GoogleTokenResponse> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: params
  });
  const body = (await response.json()) as GoogleTokenResponse;

  if (!response.ok) {
    throw new Error(body.error_description ?? body.error ?? `Google token request failed with ${response.status}.`);
  }

  return body;
}

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type YouTubeChannelsResponse = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      description?: string;
      thumbnails?: {
        default?: {
          url?: string;
        };
        medium?: {
          url?: string;
        };
      };
    };
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type YouTubePlaylistItemsResponse = {
  items?: YouTubePlaylistItemResource[];
};

type YouTubeSubscriptionsResponse = {
  items?: Array<{
    snippet?: {
      resourceId?: {
        channelId?: string;
      };
    };
  }>;
};

type YouTubeErrorResponse = {
  error?: {
    errors?: Array<{
      reason?: string;
    }>;
  };
};

type YouTubePlaylistItemResource = {
  id: string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    channelId?: string;
    publishedAt?: string;
    resourceId?: {
      videoId?: string;
    };
    thumbnails?: {
      medium?: {
        url?: string;
      };
      high?: {
        url?: string;
      };
      standard?: {
        url?: string;
      };
      maxres?: {
        url?: string;
      };
    };
  };
  contentDetails?: {
    videoId?: string;
    videoPublishedAt?: string;
  };
};

function mapPlaylistItemToVideoItem(item: YouTubePlaylistItemResource): ElectronYouTubeVideoItem | undefined {
  const videoId = item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
  if (!videoId) {
    return undefined;
  }

  const publishedAt = item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt;
  return {
    id: videoId,
    title: item.snippet?.title ?? "Untitled video",
    channel: item.snippet?.channelTitle ?? "YouTube",
    channelId: item.snippet?.channelId,
    age: formatRelativeAge(publishedAt),
    duration: "--:--",
    status: "new",
    group: "Subscriptions",
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl:
      item.snippet?.thumbnails?.maxres?.url ??
      item.snippet?.thumbnails?.standard?.url ??
      item.snippet?.thumbnails?.high?.url ??
      item.snippet?.thumbnails?.medium?.url,
    publishedAt
  };
}

function formatRelativeAge(value?: string) {
  if (!value) {
    return "unknown";
  }

  const publishedAt = new Date(value).getTime();
  if (Number.isNaN(publishedAt)) {
    return "recent";
  }

  const days = Math.max(0, Math.floor((Date.now() - publishedAt) / 86_400_000));
  if (days === 0) {
    return "today";
  }

  if (days === 1) {
    return "1 day ago";
  }

  if (days < 30) {
    return `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months === 1) {
    return "1 month ago";
  }

  return `${months} months ago`;
}

function sendCallbackResponse(response: http.ServerResponse, statusCode: number, message: string) {
  response.writeHead(statusCode, { "content-type": "text/html; charset=utf-8" });
  response.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Kickoff YouTube Authorization</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: #111; color: #fff; }
      main { max-width: 520px; padding: 32px; line-height: 1.5; }
    </style>
  </head>
  <body>
    <main>
      <h1>Kickoff</h1>
      <p>${escapeHtml(message)}</p>
    </main>
  </body>
</html>`);
}

function cleanupPendingAuth() {
  if (!pendingAuth) {
    return;
  }

  pendingAuth.server.close();
  pendingAuth = undefined;
}

function base64Url(input: Buffer) {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}
