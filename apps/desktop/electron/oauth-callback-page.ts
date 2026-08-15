type OAuthCallbackPageOptions = {
  provider: string;
  message: string;
  success: boolean;
};

export function renderOAuthCallbackPage({ provider, message, success }: OAuthCallbackPageOptions) {
  const safeProvider = escapeHtml(provider);
  const safeMessage = escapeHtml(message);
  const platformIcon = getPlatformIcon(provider);
  const stateLabel = success ? "Connection complete" : "Connection unsuccessful";
  const guidance = success
    ? "Your dashboard will update automatically. You can safely close this tab."
    : "Return to Kickoff to try again or continue without this integration.";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${safeProvider} · ${stateLabel} · Kickoff</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; overflow: hidden; background: #080b12; color: #f8fafc; }
      body::before { content: ""; position: fixed; inset: -25%; background: radial-gradient(circle at 20% 20%, rgba(185, 18, 24, .38), transparent 30%), radial-gradient(circle at 80% 80%, rgba(0, 153, 204, .28), transparent 32%); filter: blur(24px); }
      main { position: relative; width: min(92vw, 520px); padding: 44px; border: 1px solid rgba(255,255,255,.12); border-radius: 24px; background: rgba(14, 18, 28, .86); box-shadow: 0 28px 80px rgba(0,0,0,.46); text-align: center; backdrop-filter: blur(22px); }
      .logo { isolation: isolate; position: relative; display: grid; place-items: center; width: 72px; height: 72px; margin: 0 auto 28px; border-radius: 20px; background: linear-gradient(145deg, #a3080d 0%, #111522 48%, #007b9f 100%); box-shadow: 0 14px 36px rgba(0,0,0,.35); }
      .logo::before { content: ""; position: absolute; z-index: -1; inset: -2px; border-radius: 22px; background: conic-gradient(from 0deg, #ef4444, #fb7185, rgba(255,255,255,.85), #22d3ee, #0284c7, #ef4444); animation: orbit 4s linear infinite; }
      .logo::after { content: ""; position: absolute; z-index: -1; inset: 1px; border-radius: 19px; background: linear-gradient(145deg, #a3080d 0%, #111522 48%, #007b9f 100%); }
      .logo svg { width: 42px; height: 42px; filter: drop-shadow(0 2px 3px rgba(0,0,0,.35)); }
      .eyebrow { margin: 0 0 10px; color: ${success ? "#6ee7b7" : "#fca5a5"}; font-size: 12px; font-weight: 750; letter-spacing: .16em; text-transform: uppercase; }
      h1 { display: flex; align-items: center; justify-content: center; gap: 11px; margin: 0; font-size: clamp(26px, 5vw, 34px); line-height: 1.16; letter-spacing: -.025em; }
      .platform-icon { display: inline-flex; width: 30px; height: 30px; flex: none; }
      .platform-icon svg { width: 100%; height: 100%; }
      .message { margin: 16px auto 0; color: #d7dce5; font-size: 16px; line-height: 1.6; }
      .guidance { margin: 28px 0 0; padding-top: 22px; border-top: 1px solid rgba(255,255,255,.1); color: #929baa; font-size: 13px; line-height: 1.55; }
      .status { display: inline-flex; align-items: center; gap: 8px; margin-top: 24px; padding: 8px 12px; border-radius: 999px; background: ${success ? "rgba(16,185,129,.11)" : "rgba(239,68,68,.11)"}; color: ${success ? "#a7f3d0" : "#fecaca"}; font-size: 12px; font-weight: 650; }
      .status-mark { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: ${success ? "#10b981" : "#ef4444"}; color: white; font-size: 12px; }
      @keyframes orbit { to { transform: rotate(1turn); } }
      @media (prefers-reduced-motion: reduce) { .logo::before { animation: none; } }
      @media (max-width: 520px) { main { padding: 34px 24px; border-radius: 20px; } }
    </style>
  </head>
  <body>
    <main>
      <div class="logo" aria-label="Kickoff">
        <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#fff" d="M9 7h10v14.6L31.8 7H44L28.3 23.3 44.5 41H31.6L21.2 29.3 19 31.6V41H9z"/></svg>
      </div>
      <p class="eyebrow">${stateLabel}</p>
      <h1><span class="platform-icon" aria-hidden="true">${platformIcon}</span>${safeProvider}</h1>
      <p class="message">${safeMessage}</p>
      <div class="status"><span class="status-mark">${success ? "✓" : "!"}</span>${success ? "Connected to Kickoff" : "Action needed in Kickoff"}</div>
      <p class="guidance">${guidance}</p>
    </main>
  </body>
</html>`;
}

function getPlatformIcon(provider: string) {
  if (provider.toLowerCase() === "youtube") {
    return '<svg viewBox="0 0 24 24"><path fill="#ff0033" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z"/></svg>';
  }

  if (provider.toLowerCase() === "spotify") {
    return '<svg viewBox="0 0 24 24"><path fill="#1ed760" d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.85-1.74-6.44-2.13-10.67-1.17a.75.75 0 1 1-.33-1.46c4.62-1.05 8.58-.6 11.75 1.34.35.21.46.68.25 1.04Zm1.44-3.2a.94.94 0 0 1-1.29.31c-3.27-2-8.25-2.58-12.12-1.41a.94.94 0 1 1-.54-1.8c4.42-1.34 9.9-.69 13.64 1.6.44.26.58.84.31 1.28Zm.12-3.34C15.14 8.43 8.67 8.2 4.93 9.34a1.12 1.12 0 1 1-.65-2.15c4.3-1.3 11.44-1.04 15.93 1.62a1.12 1.12 0 0 1-1.15 1.94Z"/></svg>';
  }

  return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#94a3b8"/></svg>';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}
