import { useLayoutEffect, useRef, useState, type DragEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "@kickoff/ui";
import type { WidgetId } from "../types";
import type { WidgetLayout } from "../state/use-dashboard-interactions";
import { WidgetLayoutContext } from "./widget-layout-context";

type WidgetFrameProps = {
  id: WidgetId;
  editMode: boolean;
  layout: WidgetLayout;
  order: number;
  dragging: boolean;
  onDragging(id?: WidgetId): void;
  onDrop(source: WidgetId, target: WidgetId): void;
  onLayoutChange(layout: Partial<WidgetLayout>): void;
  children: ReactNode;
};

export function WidgetFrame({ id, editMode, layout, order, dragging, onDragging, onDrop, onLayoutChange, children }: WidgetFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [rowSpan, setRowSpan] = useState(1);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateSpan = () => {
      const card = frame.firstElementChild as HTMLElement | null;
      const header = card?.firstElementChild as HTMLElement | null;
      const content = card?.children.item(1) as HTMLElement | null;
      const contentStyles = content ? window.getComputedStyle(content) : null;
      const contentTop = content?.getBoundingClientRect().top ?? 0;
      const childrenBottom = content
        ? Array.from(content.children).reduce((bottom, child) => {
            const rect = child.getBoundingClientRect();
            const styles = window.getComputedStyle(child);
            return Math.max(bottom, rect.bottom - contentTop + Number.parseFloat(styles.marginBottom || "0"));
          }, 0)
        : 0;
      const naturalContentHeight = childrenBottom > 0
        ? childrenBottom + Number.parseFloat(contentStyles?.paddingBottom || "0")
        : Number.parseFloat(contentStyles?.paddingTop || "0") + Number.parseFloat(contentStyles?.paddingBottom || "0");
      // Only measure the widget's intrinsic children. The content container itself is
      // sized by the grid, so using its clientHeight or scrollHeight creates a loop.
      const intrinsicHeight = layout.collapsed
        ? (header?.getBoundingClientRect().height ?? 60) + 2
        : (header?.getBoundingClientRect().height ?? 58) + naturalContentHeight + 2;
      const contentHeight = layout.collapsed ? intrinsicHeight : layout.height ?? intrinsicHeight;
      // The grid uses 4px rows with a 16px row gap. An item spanning n rows is
      // (n * 4) + ((n - 1) * 16) pixels tall.
      const nextSpan = Math.max(1, Math.ceil((contentHeight + 16) / 20));
      setRowSpan((current) => current === nextSpan ? current : nextSpan);
    };

    updateSpan();
    const observer = new ResizeObserver(updateSpan);
    const card = frame.firstElementChild;
    if (card) {
      const header = card.firstElementChild;
      const content = card.children.item(1);
      if (header) observer.observe(header);
      if (content) Array.from(content.children).forEach((child) => observer.observe(child));
    }
    return () => observer.disconnect();
  }, [layout.collapsed, layout.height]);

  function startDrag(event: DragEvent<HTMLElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/widget-id", id);
    onDragging(id);
  }

  function startResize(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const frame = frameRef.current;
    const grid = frame?.parentElement;
    if (!frame || !grid) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const startHeight = frame.getBoundingClientRect().height;
    const gridWidth = grid.getBoundingClientRect().width;
    const columns = window.matchMedia("(min-width: 1536px)").matches ? 3 : window.matchMedia("(min-width: 1024px)").matches ? 2 : 1;
    const columnWidth = (gridWidth - (columns - 1) * 16) / columns;

    const move = (moveEvent: globalThis.PointerEvent) => {
      const span = Math.max(1, Math.min(columns, Math.round((frame.getBoundingClientRect().width + moveEvent.clientX - startX + 16) / (columnWidth + 16))));
      const height = Math.max(180, Math.round(startHeight + moveEvent.clientY - startY));
      onLayoutChange({ columnSpan: span, height });
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end, { once: true });
  }

  return (
    <WidgetLayoutContext.Provider value={{
      editMode,
      collapsed: layout.collapsed,
      onToggleCollapsed: () => onLayoutChange({ collapsed: !layout.collapsed }),
      onDragStart: startDrag,
      onDragEnd: () => onDragging(undefined),
      onResizeStart: startResize
    }}>
      <div
        ref={frameRef}
        data-widget-id={id}
        className={cn(
          "relative min-w-0 transition-[opacity,transform]",
          layout.columnSpan === 2 && "lg:col-span-2",
          layout.columnSpan >= 3 && "lg:col-span-2 2xl:col-span-3",
          editMode && "rounded-lg ring-1 ring-accent/35",
          dragging && "scale-[0.985] opacity-45"
        )}
        style={{
          order,
          gridRowEnd: `span ${rowSpan}`
        }}
        onDragOver={(event) => { if (editMode) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; } }}
        onDrop={(event) => {
          event.preventDefault();
          const source = event.dataTransfer.getData("text/widget-id") as WidgetId;
          if (source) onDrop(source, id);
          onDragging(undefined);
        }}
      >
        {children}
      </div>
    </WidgetLayoutContext.Provider>
  );
}
