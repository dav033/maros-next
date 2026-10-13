"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { TaskLabel } from "@/tasks/domain";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { taskLabelColor } from "../atoms/taskVisualTokens";

// Adapted from Bencho Tag Input's animated chip layout for persisted task labels.
// Copyright/license: MIT. Source block: https://bencho.dev/ (tag-input).
export function TaskLabelChips({
  labels,
  onRemove,
}: {
  labels: TaskLabel[];
  onRemove: (labelId: number) => void;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 500, damping: 35 };

  return (
    <div role="list" aria-label="Selected labels" className="flex flex-wrap gap-1.5">
      <AnimatePresence initial={false} mode="popLayout">
        {labels.map((label) => {
          const color = taskLabelColor(label.color);
          return (
            <motion.span
              key={label.id}
              role="listitem"
              layout={!prefersReducedMotion}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.88, y: 3 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: -2 }}
              transition={transition}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {label.name}
              <button
                type="button"
                onClick={() => onRemove(label.id)}
                aria-label={`Remove ${label.name}`}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
