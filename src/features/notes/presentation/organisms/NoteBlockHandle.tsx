"use client";

import { useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { GripVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifyEditorUndo } from "./noteEditorUndo";

/**
 * Hover-revealed grip + delete for whatever block the cursor is over — a paragraph,
 * a table, a callout, an image, a list. Tables used to only be deletable through a
 * "Delete table" button buried among nine other icons in the table's own bubble menu;
 * this replaces that with one consistent, discoverable way to remove any block.
 */
export function NoteBlockHandle({ editor }: { editor: Editor }) {
  // The tracked position only needs to be read at click time, not re-rendered on
  // every hover — a ref avoids remounting this (and its dropdown) on each move.
  const targetPos = useRef<number | null>(null);

  const handleDelete = useCallback(() => {
    const pos = targetPos.current;
    if (pos === null) return;
    const deleted = editor.chain().focus().setNodeSelection(pos).deleteSelection().run();
    if (deleted) notifyEditorUndo();
  }, [editor]);

  return (
    <DragHandle
      editor={editor}
      onNodeChange={({ node, pos }) => {
        targetPos.current = node ? pos : null;
      }}
    >
      <div className="flex items-center gap-0.5">
        <span
          className="flex h-5 w-4 cursor-grab items-center justify-center text-muted-foreground"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* draggable=false so a click here opens the menu instead of starting a
                drag — the handle's own draggable=true would otherwise win. */}
            <button
              type="button"
              draggable={false}
              title="Delete"
              aria-label="Delete block"
              className="flex h-5 w-4 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-36">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={handleDelete}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DragHandle>
  );
}
