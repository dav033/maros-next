"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MAX_ROWS = 6;
const MAX_COLS = 6;

/**
 * Pick the shape of a table before inserting it.
 *
 * The "/" menu only ever inserted a fixed 3×3, so every real table started with a
 * round of add-column / delete-row before any content went in. Hovering the grid
 * commits the size in one gesture, and the header row is part of the insert rather
 * than something to remember to switch on afterwards.
 */
export function NoteTableSizePicker({
  trigger,
  onInsert,
}: {
  trigger: ReactNode;
  onInsert: (rows: number, cols: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<{ rows: number; cols: number } | null>(
    null,
  );

  const commit = (rows: number, cols: number) => {
    setOpen(false);
    setHover(null);
    onInsert(rows, cols);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setHover(null);
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto border-line bg-elev-5 p-2"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div
          role="group"
          aria-label="Table size"
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1rem)` }}
          onMouseLeave={() => setHover(null)}
        >
          {Array.from({ length: MAX_ROWS }, (_, rowIndex) =>
            Array.from({ length: MAX_COLS }, (_, colIndex) => {
              const rows = rowIndex + 1;
              const cols = colIndex + 1;
              const selected =
                hover !== null && rows <= hover.rows && cols <= hover.cols;
              return (
                <button
                  key={`${rows}x${cols}`}
                  type="button"
                  aria-label={`${cols} columns by ${rows} rows`}
                  className={cn(
                    "size-4 rounded-[3px] border transition-colors",
                    selected
                      ? "border-primary bg-primary/30"
                      : "border-line bg-elev-3",
                  )}
                  onMouseEnter={() => setHover({ rows, cols })}
                  onFocus={() => setHover({ rows, cols })}
                  onClick={() => commit(rows, cols)}
                />
              );
            }),
          )}
        </div>
        <p
          aria-live="polite"
          className="mt-2 text-center text-[11px] tabular-nums text-muted-foreground"
        >
          {hover ? `${hover.cols} × ${hover.rows}` : "Pick a size"}
        </p>
      </PopoverContent>
    </Popover>
  );
}
