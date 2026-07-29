# YouTube Integration Plan

Status: **Authenticated subscription feed active**

This document defines the first real YouTube integration path for Kickoff. It is intentionally implementation-facing: where credentials come from, what scopes are needed, how OAuth should work in Electron, and where the code should live.

## Product Goal

YouTube is the primary integration for Kickoff. The first real milestone should let a user connect a Google/YouTube account and replace the demo YouTube queue with authenticated account data while keeping demo mode available.

MVP behaviors:

- Connect Google/YouTube account.
- Show authenticated channel/account basics.
- Fetch subscribed channels or priority channels.
- Fetch recent uploads from selected channels.
- Preserve local seen/saved state in Kickoff.
- Open videos externally in the user's browser.
- Show clear disconnected, loading, quota-limited, and error states.

## Official References

- [YouTube Data API Overview](https://developers.google.com/youtube/v3/getting-started)
- [YouTube Data API OAuth guide](https://developers.google.com/youtube/v3/guides/authentication)
- [OAuth 2.0 for mobile and desktop apps](https://developers.google.com/youtube/v3/guides/auth/installed-apps)
- [YouTube Data API Reference](https://developers.google.com/youtube/v3/docs)
- [Sample API Requests](https://developers.google.com/youtube/v3/sample_requests)
- [Subscriptions resource](https://developers.google.com/youtube/v3/docs/subscriptions)

## Google Cloud Setup

Required setup:

1. Create or select a Google Cloud project.
2. Enable **YouTube Data API v3**.
3. Configure the OAuth consent screen.
4. Create OAuth credentials for an installed/desktop app.
5. Add development/test users while the app is unpublished.
6. Store the client ID in local environment configuration.

The YouTube Data API requires API access to be enabled in the Google API Console. User-private data requires OAuth 2.0 authorization; service accounts are not the right fit for normal personal YouTube accounts.

## OAuth Strategy For Electron

Use **Authorization Code with PKCE**.

Recommended desktop flow:

- Electron main process creates a PKCE verifier/challenge.
- Renderer requests `youtube.connect()` through the preload bridge.
- Main process opens Google's consent URL in the user's default browser.
- App listens for the OAuth callback using a loopback localhost callback server.
- Main process receives and validates the authorization callback.
- Main process exchanges the authorization code for tokens.
- Main process stores tokens with Electron `safeStorage` under the app `userData` folder.
- Main process fetches the authenticated channel summary with `channels.list?mine=true`.
- Main process fetches recent uploads from the authenticated channel's uploads playlist with `playlistItems.list`.
- Renderer receives only safe connection metadata and short-lived data, never refresh tokens.

Do not use the older implicit browser flow for this Electron app.

## Initial Scopes

Start with read-only scopes.

Recommended first scope:

```text
https://www.googleapis.com/auth/youtube.readonly
```

Possible later scopes:

```text
https://www.googleapis.com/auth/youtube
https://www.googleapis.com/auth/youtube.force-ssl
```

Only add broader scopes when a feature actually needs them. This keeps the consent screen less alarming and reduces review friction.

## Environment Variables

Proposed local variables:

```text
VITE_YOUTUBE_DEMO_MODE=true
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_API_KEY=
YOUTUBE_REDIRECT_PORT=53682
```

Notes:

- `YOUTUBE_CLIENT_ID` is not a secret for an installed app, but it should still be kept out of source for easy account switching.
- `YOUTUBE_CLIENT_SECRET`, when present on the Google desktop credential, is read by Electron main only.
- `YOUTUBE_API_KEY` is used only for public read-only data such as comment threads. Restrict it to the YouTube
  Data API in Google Cloud Console; do not expose it through preload or renderer code.
- Do not add a client secret to the renderer or expose it through preload.

## Token Storage

MVP recommendation:

- Store refresh tokens from the Electron main process only.
- Use Electron `safeStorage` for the current beta.
- Keep the token file under Electron `app.getPath("userData")`.
- Renderer should request data through typed integration APIs and should not receive refresh tokens.

Temporary beta fallback, if needed:

- Use a clearly marked local development token store only during OAuth development.
- Do not commit tokens, logs with tokens, or local credential files.

## API Calls For First Milestone

Useful endpoints:

- `channels.list?part=snippet,contentDetails&mine=true`
  - Confirms the connected channel/account.
  - Returns playlist IDs such as uploads.
- `subscriptions.list?part=snippet,contentDetails&mine=true`
  - Retrieves the user's subscribed channels.
- `playlistItems.list?part=snippet,contentDetails&playlistId=...`
  - Retrieves videos from a channel uploads playlist.
- `videos.list?part=snippet,contentDetails,statistics&id=...`
  - Enriches video cards with duration and metadata.

The first implemented flow is:

1. Connect account.
2. Call `channels.list` with `mine=true`.
3. Read the authenticated channel's uploads playlist ID.
4. Call `playlistItems.list` for recent uploads.
5. Normalize those results into the existing YouTube widget shape.

Subscription-based feeds can come after this, because a combined subscription feed requires additional batching and quota care.

## Quota And Caching

YouTube Data API has quota limits, and some methods are more expensive than others.

MVP rules:

- Cache fetched YouTube responses through TanStack Query.
- Avoid auto-refresh loops.
- Add a visible manual refresh action.
- Batch video metadata lookups where possible.
- Keep demo mode available when quota or OAuth setup is unavailable.

Suggested stale times:

- Account/channel metadata: 30 minutes.
- Recent uploads: 10 to 15 minutes.
- Video metadata: 30 minutes.

## Code Structure

Current/planned files:

```text
packages/integrations/src/youtube/
  client.ts       # demo/config placeholder now, API client later
  demo-data.ts    # beta data used by the current widget
  index.ts        # public exports
  mappers.ts      # raw YouTube response normalization helpers
  types.ts        # normalized Kickoff YouTube types

apps/desktop/electron/
  env.ts # local desktop env loader
  youtube-auth.ts # OAuth PKCE callback skeleton
  youtube-token-store.ts # encrypted local token persistence
```

Existing UI integration point:

```text
packages/dashboard/src/widgets/youtube-hub.tsx
```

The dashboard should depend on normalized Kickoff types, not raw Google API response objects. This is already started through `YouTubeVideoItem` and `mapPlaylistItemToVideoItem`.

## Electron Bridge Shape

Current preload API:

```ts
window.kickoff.youtube.connect()
window.kickoff.youtube.disconnect()
window.kickoff.youtube.getStatus()
window.kickoff.youtube.getVideos()
```

Renderer responsibilities:

- Render connection state.
- Trigger connect/disconnect.
- Render normalized YouTube data.

Main process responsibilities:

- OAuth flow.
- Token refresh.
- Secure token storage.
- External browser/callback handling.

## Demo Mode

Demo mode remains important for portfolio review.

Rules:

- Demo data should stay available even after OAuth is implemented.
- If credentials are missing, YouTube widget should clearly show demo/disconnected status.
- Demo mode should never pretend to be a live account connection.

## Acceptance Criteria For First YouTube Slice

- Documentation and setup instructions exist.
- YouTube integration package structure exists.
- Demo mode still works.
- App can represent demo, disconnected, connecting, connected, and error states.
- Electron opens Google OAuth in the system browser.
- Electron owns the loopback callback listener and keeps authorization details out of the renderer.
- Electron exchanges authorization codes for tokens.
- Electron stores tokens with `safeStorage`.
- Electron can fetch the authenticated channel summary.
- Electron can fetch recent uploads from the authenticated channel.
- Demo videos remain the fallback when live videos are unavailable.
- Subscription uploads replace the connected account's own uploads in the live queue.
- A bounded channel set and ten-minute in-memory cache protect API quota.
- Priority channels and seen/saved state persist locally in the dashboard.
- Saved videos retain a local metadata snapshot and can belong to multiple user-created tags.
- The channel selector retrieves the complete subscription catalog, supports up to 24 explicit feed channels,
  and always includes priority channels.
- Videos can play in an embedded YouTube player. Kickoff stores playback position locally, resumes unfinished
  videos, and displays watched percentage in the queue and saved library.
- The player drawer includes cached, paginated, read-only top-level comments ordered by relevance.

## Known Follow-ups

- Manual refresh currently does not reliably surface newly published subscription videos; investigate API freshness,
  playlist selection, and cache-bypass behavior separately from the saved-library work.
- Keep posting comments and replies on YouTube until Kickoff deliberately adopts the broader
  `youtube.force-ssl` scope.

## Open Questions

- Should the first live feed use the authenticated channel uploads, subscriptions, or a user-selected priority channel list?
- Should token storage be implemented with keytar/electron-safe-storage or a small abstraction that can swap storage later?
