import type { HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  const classes = cx(
    "animate-pulse rounded-md bg-[var(--color-gray-subtle)]",
    className
  );

  return <div className={classes} {...props} />;
}
