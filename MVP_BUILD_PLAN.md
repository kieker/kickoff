# MVP Build Plan

## Product Direction

Build a YouTube-first desktop media dashboard for personal use and portfolio presentation.

The app should feel like a polished desktop command center where the user can sign in locally, customize the visual workspace, and connect media/community services. YouTube is the central experience. Steam and Reddit prove that the widget and integration model can scale beyond one provider. Weather adds low-friction live data and day-to-day usefulness.

App name: **Kickoff**.

## MVP Outcome

The MVP is complete when a reviewer can:

- Launch the Electron desktop app.
- Create or select a local profile.
- See a polished dashboard with customizable background and theme settings.
- Use a large YouTube-centered dashboard area with realistic data states.
- Add, remove, and rearrange widgets.
- View Steam, Reddit, Weather, and a Spotify now-playing placeholder widget.
- See polished loading, empty, disconnected, and error states.
- Build/package the app for desktop.

## MVP Feature Set

### 1. App Shell

- React + TypeScript + Vite renderer.
- Electron desktop host.
- Secure preload bridge.
- `contextIsolation: true`.
- `nodeIntegration: false`.
- Native external-link handling.
- Basic app window, title, and menu behavior.

### 2. Local Profile

- Local profile creation.
- Profile selection on launch.
- Store display name, avatar color, preferred theme, background settings, and dashboard layout.
- No cloud account for MVP.
- Optional PIN/password can be deferred unless it is easy to add cleanly.

### 3. Dashboard Layout

- Widget grid layout.
- Add/remove widgets.
- Persist widget layout per profile.
- Responsive desktop-first layout.
- Dashboard modes:
  - View mode
  - Edit layout mode
  - Settings mode

### 4. Appearance Customization

- Dark/light/system theme.
- Accent color.
- Background options:
  - Solid color
  - Gradient preset
  - Preset wallpaper
  - Local image background
- Blur and dim overlay controls.

### 5. YouTube Core

YouTube is the primary product surface.

- Central YouTube feed widget.
- Channel grouping or priority channels.
- Video cards with thumbnail, title, channel, age, duration, and status.
- Local controls:
  - Mark seen
  - Save for later
  - Pin channel
  - Open video externally
- MVP data path:
  - Start with high-quality mock/demo data.
  - Add real Google OAuth and YouTube Data API after the shell is stable.
- States:
  - Connected
  - Disconnected
  - Loading
  - Empty
  - Quota-limited
  - Error

### 6. Steam Widget

- Steam profile card.
- Recently played games.
- Playtime stats.
- Owned games if profile/API access allows.
- Open Steam profile/game externally.
- MVP data path:
  - Manual Steam ID/profile input.
  - Public/demo data first.
  - Real Steam Web API integration after app shell and storage are stable.

### 7. Reddit Widget

- Subreddit feed widget.
- Hot/new/top filter.
- Open post externally.
- Search or saved subreddit list.
- MVP data path:
  - Public subreddit feed or demo data first.
  - OAuth later if needed.
- This integration is the proof that the widget/integration architecture is reusable.

### 8. Weather Widget

- Manual location search/setup.
- Current temperature and condition.
- Daily forecast summary.
- Wind and precipitation chance.
- Real Open-Meteo data early because it is low risk and useful for proving live data.

### 9. Spotify Widget

- Small now-playing placeholder widget in beta.
- Treat real Spotify integration as phase two.
- Keep a disconnected/demo state in MVP so the dashboard composition feels complete.

## Recommended Stack

- React
- TypeScript
- Vite
- Electron
- Tailwind CSS
- shadcn/ui
- Lucide React
- Zustand for local UI state
- TanStack Query for async integration data
- React Grid Layout or an equivalent grid library
- Electron Store for simple local preferences
- SQLite later if local data grows beyond simple settings
- OS keychain storage for OAuth tokens when real auth is added

## Proposed Project Structure

```text
apps/
  desktop/
    electron/
      main.ts
      preload.ts
    src/
      App.tsx
      main.tsx
      routes/
      styles/

docs/
  README.md
  apis.md

packages/
  dashboard/
    src/
      components/
      widgets/
      state/
      layouts/

  integrations/
    src/
      youtube/
      steam/
      reddit/
      weather/
      spotify/

  platform/
    src/
      storage/
      shell/
      external-links/

  ui/
    src/
      components/
      lib/
```

The important architectural choice is to keep dashboard widgets and integration clients independent from Electron. Electron should be only the first host. That keeps a future browser extension realistic.

## Build Phases

### Phase 0: Planning And Repo Setup

- Finalize app name.
- Create project scaffold.
- Add package scripts.
- Add TypeScript, Vite, Electron, Tailwind, and shadcn-ready structure.
- Add lint/format baseline if dependencies are available.

Deliverable: project boots to a simple desktop window or browser dev preview.

### Phase 1: Static Product Shell

- Build sign-in/profile screen.
- Build main dashboard shell.
- Build top bar/sidebar.
- Build widget library drawer.
- Build settings surface.
- Create realistic mock data for YouTube, Steam, Reddit, Weather, and Spotify.

Deliverable: clickable, polished mock dashboard with no real APIs yet.

### Phase 2: Dashboard State And Personalization

- Persist local profile.
- Persist layout.
- Persist enabled widgets.
- Persist theme/background settings.
- Add edit layout mode.
- Add empty/disconnected/error state components.

Deliverable: dashboard remembers the user between app launches.

### Phase 3: Real Weather Integration

- Add Open-Meteo weather client.
- Add location setup.
- Cache weather responses.
- Add loading/error/stale states.

Deliverable: first real live-data widget.

### Phase 4: YouTube MVP

- Add YouTube integration interface.
- Keep demo data available.
- Add Google OAuth only after Electron callback and token storage approach is settled.
- Add channel grouping and local seen/saved state.

Deliverable: YouTube dashboard feels like the main product, even before every API edge case is solved.

### Phase 5: Steam And Reddit

- Add Steam profile lookup flow.
- Add recently played widget.
- Add Reddit subreddit feed widget.
- Add filtering and external open actions.

Deliverable: multiple integrations share a consistent widget/data-state model.

### Phase 6: Desktop Packaging And Portfolio Polish

- Add Electron Builder config.
- Build app installer/package.
- Add README with screenshots and architecture notes.
- Add demo mode instructions.
- Add known limits and future roadmap.

Deliverable: portfolio-ready beta.

## First Implementation Sprint

The first sprint should be deliberately small:

1. Scaffold the project.
2. Create the desktop/browser app shell.
3. Build the static dashboard screen.
4. Add mock YouTube, Steam, Reddit, Weather, and Spotify now-playing widgets.
5. Add theme/background settings as local UI state.

This gives us something visual quickly and avoids getting stuck in OAuth before the product shape exists.

## Confirmed Decisions

- App name: `Kickoff`.
- Use a monorepo layout from day one.
- Spotify real integration moves to phase two; beta includes a now-playing placeholder.
- Local image backgrounds are required in beta.
- Confirm GitHub account before creating the remote repository.

## Current Recommendation

Use the monorepo-style structure from day one, but keep it lightweight. Build a static, polished beta first, then wire in real data one integration at a time.

The first coding milestone should be:

```text
React + Electron + Tailwind shell
Profile screen
Dashboard layout
Mock YouTube-first widgets
Appearance settings
Local persistence
```
