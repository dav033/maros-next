import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = "", ...props }: TextareaProps) {
  const classes = [
    "block w-full rounded-lg border bg-theme-dark text-theme-light placeholder:text-gray-400",
    "border-theme-gray focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none",
    "px-3 py-2 text-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <textarea className={classes} {...props} />;
}