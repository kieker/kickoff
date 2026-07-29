import { ExternalLink, Loader2, MessageCircle, ThumbsUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { VideoItem } from "@kickoff/integrations";
import {
  openExternal,
  youtubeBridge,
  type PlatformYouTubeComment
} from "@kickoff/platform";
import { Button, buttonVariants } from "@kickoff/ui";
import type { VideoProgress } from "../state/use-dashboard-interactions";

type YouTubePlayerProps = {
  video?: VideoItem;
  progress?: VideoProgress;
  onProgress(videoId: string, seconds: number, duration: number): void;
  onComplete(videoId: string, duration: number): void;
  onClose(): void;
};

type YouTubePlayerInstance = {
  destroy(): void;
  getCurrentTime(): number;
  getDuration(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
};

type YouTubePlayerEvent = {
  target: YouTubePlayerInstance;
  data: number;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?(event: YouTubePlayerEvent): void;
            onStateChange?(event: YouTubePlayerEvent): void;
            onError?(event: YouTubePlayerEvent): void;
          };
        }
      ) => YouTubePlayerInstance;
      PlayerState: {
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let iframeApiPromise: Promise<void> | undefined;

export function YouTubePlayer({ video, progress, onProgress, onComplete, onClose }: YouTubePlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | undefined>(undefined);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [comments, setComments] = useState<PlatformYouTubeComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string>();
  const [nextCommentsPage, setNextCommentsPage] = useState<string>();

  useEffect(() => {
    if (!video || !hostRef.current) {
      return;
    }

    let disposed = false;
    setLoading(true);
    setError(undefined);
    loadYouTubeIframeApi()
      .then(() => {
        if (disposed || !hostRef.current || !window.YT) {
          return;
        }
        playerRef.current = new window.YT.Player(hostRef.current, {
          videoId: video.id,
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            rel: 0
          },
          events: {
            onReady(event) {
              setLoading(false);
              if (progress && !progress.completed && progress.seconds > 5) {
                event.target.seekTo(progress.seconds, true);
              }
            },
            onStateChange(event) {
              if (event.data === window.YT?.PlayerState.ENDED) {
                const duration = event.target.getDuration();
                onComplete(video.id, duration);
              }
            },
            onError(event) {
              setLoading(false);
              setError(getPlayerErrorMessage(event.data));
            }
          }
        });
      })
      .catch(() => {
        setLoading(false);
        setError("Kickoff could not load the YouTube player.");
      });

    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) {
        return;
      }
      const seconds = player.getCurrentTime();
      const duration = player.getDuration();
      if (duration > 0) {
        onProgress(video.id, seconds, duration);
      }
    }, 5000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      const player = playerRef.current;
      if (player) {
        const duration = player.getDuration();
        if (duration > 0) {
          onProgress(video.id, player.getCurrentTime(), duration);
        }
        player.destroy();
        playerRef.current = undefined;
      }
    };
  }, [video?.id]);

  useEffect(() => {
    if (!video) {
      return;
    }
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "Tab" && drawerRef.current) {
        const focusable = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) {
          event.preventDefault();
          return;
        }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      previouslyFocused?.focus();
    };
  }, [video?.id, onClose]);

  useEffect(() => {
    if (!video) {
      return;
    }
    setComments([]);
    setCommentsError(undefined);
    setNextCommentsPage(undefined);
    void loadComments(video.id);
  }, [video?.id]);

  async function loadComments(videoId: string, pageToken?: string) {
    setCommentsLoading(true);
    const result = await youtubeBridge.getComments(videoId, pageToken);
    setCommentsLoading(false);
    if (!result || result.status === "error") {
      setCommentsError(result?.message ?? "Kickoff could not load comments.");
      return;
    }
    setComments((current) => (pageToken ? [...current, ...result.comments] : result.comments));
    setNextCommentsPage(result.nextPageToken);
  }

  if (!video) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/52 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="youtube-player-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section ref={drawerRef} className="absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col overflow-hidden border-l border-white/12 bg-background shadow-2xl">
        <header className="border-b border-black/10 p-4 dark:border-white/10">
          <div className="min-w-0 max-w-full">
            <h2 id="youtube-player-title" className="truncate text-lg font-semibold">{video.title}</h2>
            <p className="text-sm text-muted-foreground">{video.channel}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => openExternal(video.url)}>
              <ExternalLink className="h-4 w-4" />
              Open on YouTube
            </Button>
            <button ref={closeButtonRef} type="button" className={buttonVariants({ variant: "ghost", size: "sm" })} onClick={onClose}>
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </header>

        <div className="relative aspect-video w-full shrink-0 bg-black">
          <div ref={hostRef} className="h-full w-full" />
          {loading ? (
            <div className="absolute inset-0 grid place-items-center bg-black text-sm text-white">
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading player
              </span>
            </div>
          ) : null}
          {error ? (
            <div className="absolute inset-0 grid place-items-center bg-zinc-950 p-8 text-center text-sm text-white">
              <div>
                <p>{error}</p>
                <Button className="mt-4" variant="primary" onClick={() => openExternal(video.url)}>
                  <ExternalLink className="h-4 w-4" />
                  Open on YouTube
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <section className="min-h-0 flex-1 overflow-y-auto border-t border-black/10 p-4 dark:border-white/10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <MessageCircle className="h-4 w-4" />
              Comments
            </h3>
            <span className="text-xs text-muted-foreground">Read-only</span>
          </div>

          {commentsError ? (
            <p className="rounded-md border border-black/10 bg-black/[0.03] px-3 py-2 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]">
              {commentsError}
            </p>
          ) : null}

          <div className="grid gap-3">
            {comments.map((comment) => (
              <article key={comment.id} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-black/10 text-xs dark:bg-white/10">
                  {comment.authorAvatarUrl ? (
                    <img src={comment.authorAvatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    comment.author.slice(0, 1)
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="text-xs font-semibold">{comment.author}</p>
                    {comment.publishedAt ? (
                      <time className="text-[11px] text-muted-foreground" dateTime={comment.publishedAt}>
                        {formatCommentAge(comment.publishedAt)}
                      </time>
                    ) : null}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{comment.text}</p>
                  <div className="mt-1 flex gap-3 text-[11px] text-muted-foreground">
                    {comment.likeCount > 0 ? (
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {comment.likeCount}
                      </span>
                    ) : null}
                    {comment.replyCount > 0 ? <span>{comment.replyCount} replies</span> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {commentsLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading comments
            </div>
          ) : null}
          {!commentsLoading && nextCommentsPage ? (
            <Button
              className="mt-4"
              variant="ghost"
              size="sm"
              onClick={() => void loadComments(video.id, nextCommentsPage)}
            >
              Load more comments
            </Button>
          ) : null}
          {!commentsLoading && !commentsError && comments.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">No comments were returned.</p>
          ) : null}
        </section>

        <footer className="flex items-center justify-between gap-3 p-4 text-xs text-muted-foreground">
          <span>Playback progress is stored locally in Kickoff.</span>
          <span>{formatProgress(progress)}</span>
        </footer>
      </section>
    </div>
  );
}

function loadYouTubeIframeApi() {
  if (window.YT?.Player) {
    return Promise.resolve();
  }
  if (iframeApiPromise) {
    return iframeApiPromise;
  }
  iframeApiPromise = new Promise<void>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };
    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) {
      existingScript.addEventListener("error", () => reject(new Error("YouTube player script failed.")), {
        once: true
      });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.addEventListener("error", () => reject(new Error("YouTube player script failed.")), { once: true });
    document.head.appendChild(script);
  });
  return iframeApiPromise;
}

function formatProgress(progress?: VideoProgress) {
  if (!progress || progress.duration <= 0) {
    return "Not started";
  }
  const percentage = Math.min(100, Math.round((progress.seconds / progress.duration) * 100));
  return progress.completed ? "Completed" : `${percentage}% watched`;
}

function getPlayerErrorMessage(code: number) {
  switch (code) {
    case 101:
    case 150:
      return `YouTube error ${code}: this channel does not allow the video to play in embedded players.`;
    case 153:
      return "YouTube error 153: the player could not verify Kickoff's embed identity.";
    case 100:
      return "YouTube error 100: this video was removed, made private, or could not be found.";
    case 5:
      return "YouTube error 5: this video could not be played in the embedded HTML5 player.";
    default:
      return `YouTube player error ${code}. You can still open this video on YouTube.`;
  }
}

function formatCommentAge(value: string) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "";
  }
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
  if (days === 0) {
    return "today";
  }
  if (days < 30) {
    return `${days}d ago`;
  }
  if (days < 365) {
    return `${Math.floor(days / 30)}mo ago`;
  }
  return `${Math.floor(days / 365)}y ago`;
}
