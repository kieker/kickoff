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
- Subscription-based queue replacement is the next YouTube slice.
- See [YouTube Integration Plan](./integrations/youtube.md) for implementation details.

## Steam Web API

Status: **Planned**

Purpose:

- Steam profile lookup.
- Recently played games.
- Owned games and achievement progress where available.

Official docs:

- [Steam Web API documentation](https://steamcommunity.com/dev)

Planned project area:

- `packages/integrations/src/steam/`
- `packages/dashboard/src/widgets/steam-widget.tsx`

Notes:

- Some profile/game data depends on profile privacy settings.
- Current beta uses demo data from `packages/integrations/src/index.ts`.

## Reddit API

Status: **Planned**

Purpose:

- Subreddit feeds.
- Hot/new/top filters.
- OAuth-backed user/community data later.

Official docs:

- [Reddit API docs](https://www.reddit.com/dev/api/)

Planned project area:

- `packages/integrations/src/reddit/`
- `packages/dashboard/src/widgets/reddit-widget.tsx`

Notes:

- Current beta uses demo data from `packages/integrations/src/index.ts`.
- Public feed support can land before authenticated user feeds.

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
