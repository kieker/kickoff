# API References

This document tracks external APIs used by Kickoff and where each one ties into the project.

## Open-Meteo

Status: **Active in beta**

Purpose:

- Location search for the Weather widget.
- Current weather conditions.
- Short daily forecast.

Official docs:

- [Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
- [Forecast API OpenAPI spec](https://github.com/open-meteo/open-meteo/blob/main/openapi.yml)

Project files:

- `packages/integrations/src/weather.ts`
- `packages/integrations/src/index.ts`
- `packages/dashboard/src/widgets/weather-widget.tsx`
- `packages/dashboard/src/state/use-dashboard-interactions.ts`

Notes:

- No API key is required for the current non-commercial beta usage.
- The dashboard uses manual city search instead of browser geolocation.
- The selected location is stored locally with the dashboard interaction state.

## YouTube Data API

Status: **Authenticated uploads active**

Purpose:

- Subscription/recent video feed.
- Priority channels.
- Video metadata.
- Local seen/saved state around YouTube items.

Official docs:

- [YouTube Data API overview](https://developers.google.com/youtube/v3/getting-started)
- [YouTube OAuth guide](https://developers.google.com/youtube/v3/guides/authentication)
- [OAuth 2.0 for mobile and desktop apps](https://developers.google.com/youtube/v3/guides/auth/installed-apps)

Project area:

- `packages/integrations/src/youtube/`
- `packages/dashboard/src/widgets/youtube-hub.tsx`
- `apps/desktop/electron/youtube-auth.ts`

Notes:

- Requires a Google Cloud project, YouTube Data API enabled, OAuth credentials, scopes, and quota management.
- Current beta uses demo data from `packages/integrations/src/youtube/demo-data.ts`.
- Electron owns the PKCE authorization URL, loopback callback, token exchange, and secure local token storage.
- Electron can call `channels.list?mine=true` to confirm the connected channel.
- Electron can call `playlistItems.list` against the authenticated channel's uploads playlist.
- The live queue is assembled from recent uploads across a bounded set of subscribed channels.
- Subscription results are cached for ten minutes and priority-channel ordering remains local.
- See [YouTube Integration Plan](./integrations/youtube.md) for implementation details.

## Steam Web API

Status: **Public profile and recently played games active**

Purpose:

- Steam profile lookup.
- Recently played games.
- Owned games and achievement progress where available.

Official docs:

- [Steam Web API documentation](https://steamcommunity.com/dev)

Project area:

- `apps/desktop/electron/steam-api.ts`
- `packages/platform/src/index.ts`
- `packages/dashboard/src/state/use-steam-profile.ts`
- `packages/dashboard/src/widgets/steam-widget.tsx`

Notes:

- Some profile/game data depends on profile privacy settings.
- Enter a SteamID64, vanity name, or Steam Community profile URL in the widget.
- The Steam Web API key remains in Electron and is never exposed to renderer code.
- Live results are cached for five minutes. The widget uses demo data until `STEAM_API_KEY` is configured.
- The current manual profile and local API-key configuration is a development fallback. The client-facing target is Steam OpenID plus a Kickoff backend that protects the application API key; see [First-Run Integration Setup](./onboarding.md).

## Reddit API

Status: **Read-only community feeds active**

Purpose:

- Subreddit feeds.
- Hot/new/top filters.
- OAuth-backed user/community data later.

Official docs:

- [Reddit API docs](https://www.reddit.com/dev/api/)

Project area:

- `packages/integrations/src/reddit.ts`
- `apps/desktop/electron/reddit-api.ts`
- `packages/platform/src/index.ts`
- `packages/dashboard/src/state/use-reddit-feed.ts`
- `packages/dashboard/src/widgets/reddit-widget.tsx`

Notes:

- Configure `REDDIT_CLIENT_ID` with the client ID of a Reddit installed application.
- Set `REDDIT_USER_AGENT` to a descriptive application/version/contact value before distribution.
- Electron uses Reddit's installed-client application-only OAuth grant; no client secret is shipped or required.
- Users can choose up to 20 communities and switch between hot, new, and top feeds without connecting a Reddit account.
- Feed results are cached for two minutes. Missing credentials and API failures retain demo posts with a visible status message.
- Community preferences are stored locally under a versioned, profile-ready key.
- User OAuth and subscription import remain a later phase.

## Spotify Web API

Status: **Phase two**

Purpose:

- Now playing.
- Recent tracks.
- Playlists.

Official docs:

- [Spotify Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)

Planned project area:

- `packages/integrations/src/spotify/`
- `packages/dashboard/src/widgets/spotify-widget.tsx`

Notes:

- Electron should use OAuth with PKCE.
- Current beta includes a now-playing placeholder only.
