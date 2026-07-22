import { shell } from "electron";
import crypto from "node:crypto";
import http from "node:http";
import { URL } from "node:url";

const YOUTUBE_SCOPE = "https://www.googleapis.com/auth/youtube.readonly";
const DEFAULT_REDIRECT_PORT = 53682;
const CALLBACK_PATH = "/youtube/oauth/callback";

export type ElectronYouTubeConnectionState =
  | { status: "demo"; message: string; redirectUri: string; scope: string }
  | { status: "disconnected"; message?: string; redirectUri: string; scope: string }
  | { status: "connecting"; message: string; redirectUri: string; scope: string }
  | { status: "connected"; message: string }
  | { status: "error"; message: string; redirectUri?: string; scope?: string };

type PendingAuth = {
  server: http.Server;
  state: string;
  verifier: string;
};

let pendingAuth: PendingAuth | undefined;
let currentStatus: ElectronYouTubeConnectionState | undefined;

export function getYouTubeAuthStatus(): ElectronYouTubeConnectionState {
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

  return (
    currentStatus ?? {
      status: "disconnected",
      redirectUri: config.redirectUri,
      scope: YOUTUBE_SCOPE
    }
  );
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

export function disconnectYouTube(): ElectronYouTubeConnectionState {
  cleanupPendingAuth();
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
    const server = http.createServer((request, response) => {
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

      currentStatus = {
        status: "error",
        message: "Authorization received. Token exchange and secure storage are the next integration slice.",
        redirectUri,
        scope: YOUTUBE_SCOPE
      };
      void verifier;
      sendCallbackResponse(response, 200, "Kickoff received authorization. You can close this tab and return to the app.");
      cleanupPendingAuth();
    });

    server.once("error", (error) => {
      reject(error);
    });

    server.listen(Number(callbackUrl.port), callbackUrl.hostname, () => {
      resolve(server);
    });
  });
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
