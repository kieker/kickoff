import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, MoreHorizontal } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, cn } from "@kickoff/ui";
import { useWidgetLayout } from "./widget-layout-context";

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
  const layout = useWidgetLayout();

  return (
    <Card className={cn("h-full min-h-0 overflow-hidden", className)}>
      <CardHeader>
        {layout?.editMode ? (
          <button
            type="button"
            aria-label={`Drag ${title} widget`}
            title="Drag to reorder"
            draggable
            onDragStart={layout.onDragStart}
            onDragEnd={layout.onDragEnd}
            className="-ml-2 grid h-9 w-7 shrink-0 cursor-grab place-items-center rounded text-muted-foreground hover:bg-accent/12 hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : null}
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
        <div className="ml-auto flex items-center gap-1">
        {layout?.editMode ? (
          <Button aria-label={`${layout.collapsed ? "Expand" : "Collapse"} ${title}`} title={layout.collapsed ? "Expand widget" : "Collapse widget"} size="icon" variant="ghost" onClick={layout.onToggleCollapsed}>
            {layout.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        ) : null}
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
        </div>
      </CardHeader>
      {!layout?.collapsed ? <CardContent className="h-[calc(100%-3.75rem)] overflow-auto">{children}</CardContent> : null}
      {layout?.editMode && !layout.collapsed ? (
        <button
          type="button"
          aria-label={`Resize ${title} widget`}
          title="Drag to resize"
          onPointerDown={layout.onResizeStart}
          className="absolute bottom-0 right-0 z-20 h-7 w-7 cursor-se-resize rounded-tl-md border-l border-t border-accent/30 bg-accent/16"
        >
          <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b-2 border-r-2 border-accent" />
        </button>
      ) : null}
    </Card>
  );
}
