import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground hover:brightness-110",
  secondary: "bg-black/8 text-foreground hover:bg-black/12 dark:bg-white/10 dark:hover:bg-white/16",
  ghost: "bg-transparent text-muted-foreground hover:bg-black/8 hover:text-foreground dark:hover:bg-white/10",
  danger: "bg-red-500/18 text-red-100 hover:bg-red-500/26"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  icon: "h-9 w-9 p-0"
};

export function buttonVariants({
  variant = "secondary",
  size = "md"
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-black/10 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 dark:border-white/10",
    variantClasses[variant],
    sizeClasses[size]
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  const tooltip = props.title ?? (typeof props["aria-label"] === "string" ? props["aria-label"] : undefined);
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; arrowOffset: number; top: number; placement: "top" | "bottom" }>();

  function showTooltip(immediate = false) {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect || !tooltip) return;
      const placement = rect.top > 54 ? "top" : "bottom";
      const anchor = rect.left + rect.width / 2;
      const estimatedWidth = Math.min(256, Math.max(72, tooltip.length * 6.6 + 26));
      const halfWidth = estimatedWidth / 2;
      const left = Math.max(halfWidth + 10, Math.min(window.innerWidth - halfWidth - 10, anchor));
      setTooltipPosition({
        left,
        arrowOffset: Math.max(-halfWidth + 14, Math.min(halfWidth - 14, anchor - left)),
        top: placement === "top" ? rect.top - 10 : rect.bottom + 10,
        placement
      });
    }, immediate ? 0 : 320);
  }

  function hideTooltip() {
    window.clearTimeout(timerRef.current);
    setTooltipPosition(undefined);
  }

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return (
    <>
      <button
        ref={buttonRef}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
        title={undefined}
        aria-describedby={tooltipPosition ? tooltipId : props["aria-describedby"]}
        onPointerEnter={(event) => { props.onPointerEnter?.(event); showTooltip(); }}
        onPointerLeave={(event) => { props.onPointerLeave?.(event); hideTooltip(); }}
        onFocus={(event) => { props.onFocus?.(event); showTooltip(true); }}
        onBlur={(event) => { props.onBlur?.(event); hideTooltip(); }}
        onClick={(event) => { hideTooltip(); props.onClick?.(event); }}
      />
      {tooltip && tooltipPosition && typeof document !== "undefined" ? createPortal(
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none fixed z-[100] max-w-64 whitespace-nowrap rounded-lg border border-black/15 bg-white/95 px-3 py-1.5 text-[11px] font-medium tracking-wide text-zinc-800 shadow-[0_10px_28px_rgba(24,24,27,0.16),inset_0_0_0_1px_rgba(255,255,255,0.75)] backdrop-blur-md dark:border-black/80 dark:bg-zinc-950/95 dark:text-zinc-200 dark:shadow-[0_10px_28px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.035)]"
          style={{
            left: tooltipPosition.left,
            top: tooltipPosition.top,
            transform: tooltipPosition.placement === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
            animation: "kickoff-tooltip-in 140ms ease-out"
          }}
        >
          {tooltip}
          <span
            className={cn(
              "absolute h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-white dark:bg-zinc-950",
              tooltipPosition.placement === "top"
                ? "-bottom-1.5 border-b border-r border-black/15 dark:border-black/80"
                : "-top-1.5 border-l border-t border-black/15 dark:border-black/80"
            )}
            style={{ left: `calc(50% + ${tooltipPosition.arrowOffset}px)` }}
          />
        </span>,
        document.body
      ) : null}
    </>
  );
}
