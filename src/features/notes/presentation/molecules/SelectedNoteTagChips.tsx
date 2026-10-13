"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { NoteTag } from "@/notes/domain";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { noteTagColor } from "../atoms/noteVisualTokens";

// Adapted from Bencho Tag Input's chip layout feedback for selected note labels.
// Copyright/license: MIT. Source block: https://bencho.dev/ (tag-input).
export function SelectedNoteTagChips({
  tags,
  onRemove,
}: {
  tags: NoteTag[];
  onRemove: (tagId: number) => void;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 500, damping: 35 };

  if (tags.length === 0) return null;

  return (
    <div role="list" aria-label="Selected note labels" className="flex flex-wrap gap-1.5 border-b border-border pb-2">
      <AnimatePresence initial={false} mode="popLayout">
        {tags.map((tag) => {
          const color = noteTagColor(tag.color);
          return (
            <motion.span
              key={tag.id}
              role="listitem"
              layout={!prefersReducedMotion}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.88, y: 3 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: -2 }}
              transition={transition}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => onRemove(tag.id)}
                aria-label={`Remove ${tag.name}`}
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
