import type { InputHTMLAttributes } from "react";

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className = "", ...props }: CheckboxProps) {
  const classes = [
    "h-4 w-4 rounded border border-theme-gray bg-theme-dark text-[var(--color-primary)]",
    "focus:ring-[var(--color-primary)] focus:outline-none cursor-pointer",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <input type="checkbox" className={classes} {...props} />;
}
