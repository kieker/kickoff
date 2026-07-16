import type { InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function Slider({
  className,
  type = "range",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-black/12 accent-[hsl(var(--accent))] dark:bg-white/14",
        className
      )}
      {...props}
    />
  );
}
