const STEAM_API_ROOT = "https://api.steampowered.com";
const CACHE_TTL_MS = 1000 * 60 * 5;

export type ElectronSteamProfile = {
  steamId: string;
  name: string;
  profileUrl: string;
  avatarUrl?: string;
  status: string;
  lastLogoffAt?: string;
};

export type ElectronSteamGame = {
  id: string;
  title: string;
  playtimeMinutes: number;
  recentPlaytimeMinutes: number;
  lastPlayedAt?: string;
  iconUrl?: string;
};

export type ElectronSteamResult =
  | { status: "demo"; message: string }
  | { status: "connected"; profile: ElectronSteamProfile; games: ElectronSteamGame[] }
  | { status: "error"; message: string };

let cache:
  | { profileInput: string; expiresAt: number; result: Extract<ElectronSteamResult, { status: "connected" }> }
  | undefined;

export async function getSteamProfile(profileInput: string, forceRefresh = false): Promise<ElectronSteamResult> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    return { status: "demo", message: "Add STEAM_API_KEY to enable live Steam profiles." };
  }

  const normalizedInput = profileInput.trim();
  if (!normalizedInput) {
    return { status: "error", message: "Enter a SteamID64 or Steam profile URL." };
  }

  if (!forceRefresh && cache?.profileInput === normalizedInput && cache.expiresAt > Date.now()) {
    return cache.result;
  }

  try {
    const steamId = await resolveSteamId(normalizedInput, apiKey);
    const [profile, games] = await Promise.all([
      fetchPlayerSummary(steamId, apiKey),
      fetchRecentlyPlayedGames(steamId, apiKey)
    ]);
    const result = { status: "connected" as const, profile, games };
    cache = { profileInput: normalizedInput, expiresAt: Date.now() + CACHE_TTL_MS, result };
    return result;
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Kickoff could not load this Steam profile."
    };
  }
}

async function resolveSteamId(input: string, apiKey: string) {
  const candidate = extractProfileIdentifier(input);
  if (/^\d{17}$/.test(candidate)) {
    return candidate;
  }

  const body = await fetchSteamJson<{
    response?: { success?: number; steamid?: string; message?: string };
  }>("ISteamUser/ResolveVanityURL/v1/", { key: apiKey, vanityurl: candidate });
  if (body.response?.success !== 1 || !body.response.steamid) {
    throw new Error(body.response?.message || "That Steam profile could not be resolved.");
  }
  return body.response.steamid;
}

function extractProfileIdentifier(input: string) {
  try {
    const url = new URL(input.includes("://") ? input : `https://${input}`);
    if (url.hostname.endsWith("steamcommunity.com")) {
      const match = url.pathname.match(/^\/(?:id|profiles)\/([^/]+)/);
      if (match?.[1]) {
        return decodeURIComponent(match[1]);
      }
    }
  } catch {
    // Plain vanity names and SteamID64 values are valid inputs.
  }
  return input.replace(/^@/, "").replace(/\/+$/, "");
}

async function fetchPlayerSummary(steamId: string, apiKey: string): Promise<ElectronSteamProfile> {
  const body = await fetchSteamJson<{
    response?: {
      players?: Array<{
        steamid: string;
        personaname: string;
        profileurl: string;
        avatarfull?: string;
        personastate?: number;
        lastlogoff?: number;
      }>;
    };
  }>("ISteamUser/GetPlayerSummaries/v2/", { key: apiKey, steamids: steamId });
  const player = body.response?.players?.[0];
  if (!player) {
    throw new Error("Steam returned no public profile for that account.");
  }
  return {
    steamId: player.steamid,
    name: player.personaname,
    profileUrl: player.profileurl,
    avatarUrl: player.avatarfull,
    status: describePersonaState(player.personastate),
    lastLogoffAt: player.lastlogoff ? new Date(player.lastlogoff * 1000).toISOString() : undefined
  };
}

async function fetchRecentlyPlayedGames(steamId: string, apiKey: string): Promise<ElectronSteamGame[]> {
  const body = await fetchSteamJson<{
    response?: {
      games?: Array<{
        appid: number;
        name: string;
        playtime_forever?: number;
        playtime_2weeks?: number;
        rtime_last_played?: number;
        img_icon_url?: string;
      }>;
    };
  }>("IPlayerService/GetRecentlyPlayedGames/v1/", { key: apiKey, steamid: steamId, count: "5" });
  return (body.response?.games ?? []).map((game) => ({
    id: String(game.appid),
    title: game.name,
    playtimeMinutes: game.playtime_forever ?? 0,
    recentPlaytimeMinutes: game.playtime_2weeks ?? 0,
    lastPlayedAt: game.rtime_last_played ? new Date(game.rtime_last_played * 1000).toISOString() : undefined,
    iconUrl: game.img_icon_url
      ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
      : undefined
  }));
}

async function fetchSteamJson<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${STEAM_API_ROOT}/${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Steam API request failed (${response.status}).`);
  }
  return (await response.json()) as T;
}

function describePersonaState(state = 0) {
  return ["Offline", "Online", "Busy", "Away", "Snooze", "Looking to trade", "Looking to play"][state] ?? "Offline";
}
