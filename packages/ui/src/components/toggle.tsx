import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

interface ToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
}

export function Toggle({ className, pressed, ...props }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition",
        pressed
          ? "border-accent bg-accent text-accent-foreground"
          : "border-black/10 bg-black/6 text-muted-foreground hover:bg-black/10 hover:text-foreground dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14",
        className
      )}
      {...props}
    />
  );
}
