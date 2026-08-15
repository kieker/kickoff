import type { ReactNode } from "react";
import { Check, Music2, Play, PlugZap, X } from "lucide-react";
import { Button } from "@kickoff/ui";

export type IntegrationWizardEntry = "welcome" | "setup";
type ConnectionStatus = "connected" | "connecting" | "disconnected" | "demo" | "error";

type IntegrationWizardProps = {
  open: boolean;
  entry: IntegrationWizardEntry;
  youtubeStatus: ConnectionStatus;
  spotifyStatus: ConnectionStatus;
  youtubeBusy: boolean;
  spotifyBusy: boolean;
  onConnectYouTube(): void;
  onConnectSpotify(): void;
  onComplete(): void;
};

export function IntegrationWizard(props: IntegrationWizardProps) {
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div aria-labelledby="integration-wizard-title" aria-modal="true" className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/12 bg-card shadow-2xl" role="dialog">
        {props.entry === "welcome" ? <Welcome onProceed={props.onConnectYouTube} onSkip={props.onComplete} /> : <Setup {...props} />}
      </div>
    </div>
  );
}

function Welcome({ onProceed, onSkip }: { onProceed(): void; onSkip(): void }) {
  return (
    <div className="p-7 sm:p-9">
      <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent"><PlugZap className="h-7 w-7" /></div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Welcome to Kickoff</p>
      <h2 id="integration-wizard-title" className="mt-2 text-3xl font-semibold tracking-tight">Bring your media into one place</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Connect your accounts now to personalize the dashboard, or skip integrations and explore first. Nothing is locked in—you can run this guide again or connect from each individual widget at any time.
      </p>
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onSkip}>Skip integrations</Button>
        <Button variant="primary" onClick={onProceed}>Set up integrations <PlugZap className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function Setup({ youtubeStatus, spotifyStatus, youtubeBusy, spotifyBusy, onConnectYouTube, onConnectSpotify, onComplete }: IntegrationWizardProps) {
  const connectedCount = Number(youtubeStatus === "connected") + Number(spotifyStatus === "connected");
  return (
    <>
      <div className="flex items-start justify-between border-b border-black/10 px-6 py-5 dark:border-white/10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Integration setup</p>
          <h2 id="integration-wizard-title" className="mt-1 text-xl font-semibold">Connect your accounts</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose any services you want to use. You can come back later.</p>
        </div>
        <Button aria-label="Close integration setup" size="icon" variant="ghost" onClick={onComplete}><X className="h-4 w-4" /></Button>
      </div>
      <div className="space-y-3 p-6">
        <ProviderRow icon={<Play className="h-5 w-5" />} name="YouTube" description="Load your subscriptions and build a personal video queue." status={youtubeStatus} busy={youtubeBusy} onConnect={onConnectYouTube} />
        <ProviderRow icon={<Music2 className="h-5 w-5" />} name="Spotify" description="Show current playback and your recently played tracks." status={spotifyStatus} busy={spotifyBusy} onConnect={onConnectSpotify} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-6 py-5 dark:border-white/10">
        <p className="text-xs text-muted-foreground">{connectedCount} of 2 connected</p>
        <Button variant="primary" onClick={onComplete}>{connectedCount === 2 ? "Finish setup" : "Done for now"}</Button>
      </div>
    </>
  );
}

function ProviderRow({ icon, name, description, status, busy, onConnect }: { icon: ReactNode; name: string; description: string; status: ConnectionStatus; busy: boolean; onConnect(): void }) {
  const connected = status === "connected";
  const connecting = status === "connecting" || busy;
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/10 bg-black/[0.025] p-4 dark:border-white/10 dark:bg-white/[0.035] sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent">{icon}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2"><h3 className="font-semibold">{name}</h3>{connected ? <span className="flex items-center gap-1 text-xs text-emerald-500"><Check className="h-3.5 w-3.5" /> Connected</span> : null}</div>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      {connected ? <span className="px-3 text-xs text-muted-foreground">Ready</span> : <Button size="sm" variant="secondary" disabled={connecting} onClick={onConnect}>{connecting ? "Connecting…" : "Connect"}</Button>}
    </div>
  );
}
