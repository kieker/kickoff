import type { ReactNode } from "react";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, cn } from "@kickoff/ui";

type WidgetShellProps = {
  title: string;
  eyebrow?: string;
  icon?: ReactNode;
  action?: ReactNode;
  onHide?: () => void;
  onRefresh?: () => void;
  className?: string;
  children: ReactNode;
};

export function WidgetShell({
  title,
  eyebrow,
  icon,
  action,
  onHide,
  onRefresh,
  className,
  children
}: WidgetShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Card className={cn("min-h-0 overflow-hidden", className)}>
      <CardHeader>
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <div
              aria-hidden="true"
              data-widget-icon="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent/14 text-accent"
            >
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-1 text-[11px] font-medium uppercase text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            <CardTitle>{title}</CardTitle>
          </div>
        </div>
        {action ?? (
          <div className="relative">
            <Button
              aria-label={`${title} options`}
              size="icon"
              variant={menuOpen ? "primary" : "ghost"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {menuOpen ? (
              <div className="absolute right-0 top-10 z-10 w-40 rounded-md border border-black/10 bg-card/95 p-1 text-sm shadow-panel dark:border-white/12">
                <button
                  type="button"
                  className="block w-full rounded px-3 py-2 text-left transition hover:bg-black/8 dark:hover:bg-white/10"
                  onClick={() => {
                    onRefresh?.();
                    setMenuOpen(false);
                  }}
                >
                  Refresh widget
                </button>
                <button
                  type="button"
                  className="block w-full rounded px-3 py-2 text-left transition hover:bg-black/8 dark:hover:bg-white/10"
                  onClick={() => {
                    setMenuOpen(false);
                  }}
                >
                  Configure soon
                </button>
                {onHide ? (
                  <button
                    type="button"
                    className="block w-full rounded px-3 py-2 text-left text-red-500 transition hover:bg-red-500/10"
                    onClick={() => {
                      onHide();
                      setMenuOpen(false);
                    }}
                  >
                    Hide widget
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
