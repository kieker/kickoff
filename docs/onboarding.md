# First-Run Integration Setup

Kickoff should guide each user through integration setup the first time the app runs. The goal is a clear, optional setup experience rather than requiring users to discover configuration fields inside individual widgets.

## Product Requirements

- Present integrations one at a time with a short explanation of the data and features they enable.
- Clearly distinguish user authorization from application credentials. End users should connect their own accounts; they should not normally create or paste developer API keys.
- Explain requested permissions, data storage, privacy limitations, and disconnect behavior before authorization.
- Show connected, skipped, unavailable, and failed states for every provider.
- Allow every step to be skipped so demo mode remains usable.
- Save onboarding progress locally and avoid showing the guide again after completion.
- Make the full setup guide available later from Settings so integrations can be connected, changed, or disconnected.
- Support restarting an individual provider's setup without resetting unrelated dashboard preferences.

## Planned Provider Experience

- **YouTube:** Connect with Google OAuth, confirm the selected channel, then choose subscriptions or priority channels.
- **Steam:** Connect with Steam OpenID. A Kickoff backend should verify the returned SteamID and call the Steam Web API with Kickoff's protected application key. Private-profile limitations must be explained. The current manual profile/API-key flow remains a local-development fallback.
- **Reddit:** Import the user's existing locally selected communities, or let them edit the list. Account authorization is only needed when personalized feeds or subscription import are added.
- **Weather:** Search for and confirm a location. No account is required.
- **Spotify:** Connect with OAuth when the phase-two integration is implemented.

## Suggested Flow

1. Welcome and privacy summary.
2. Choose which integrations to configure.
3. Complete each selected provider's connection and preferences.
4. Review connection states and retry failures.
5. Enter the dashboard, with skipped providers using demo or disconnected states.

OAuth tokens and provider secrets must use secure platform storage. The renderer should receive only the minimum connection state and data required to render the dashboard.
