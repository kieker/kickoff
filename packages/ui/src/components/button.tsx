import type { ButtonHTMLAttributes } from "react";
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
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
