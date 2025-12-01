import type { LabelHTMLAttributes } from "react";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = "", ...props }: LabelProps) {
  const classes = [
    "block text-xs font-medium uppercase tracking-wide text-gray-300",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <label className={classes} {...props} />;
}
