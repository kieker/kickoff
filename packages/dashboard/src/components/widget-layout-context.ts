import { createContext, useContext, type DragEventHandler, type PointerEventHandler } from "react";

type WidgetLayoutContextValue = {
  editMode: boolean;
  collapsed: boolean;
  onToggleCollapsed(): void;
  onDragStart: DragEventHandler<HTMLElement>;
  onDragEnd: DragEventHandler<HTMLElement>;
  onResizeStart: PointerEventHandler<HTMLButtonElement>;
};

export const WidgetLayoutContext = createContext<WidgetLayoutContextValue | null>(null);

export function useWidgetLayout() {
  return useContext(WidgetLayoutContext);
}
