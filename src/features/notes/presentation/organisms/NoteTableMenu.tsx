"use client";

import type { Editor } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Columns3,
  Combine,
  Heading,
  Rows3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notifyEditorUndo } from "./noteEditorUndo";

type TableAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  run: (editor: Editor) => boolean;
  /** Destructive actions get the red hover treatment. */
  danger?: boolean;
  /** Destructive table edits remain immediate and can be undone with the editor history. */
  undoable?: boolean;
};

const ACTIONS: TableAction[] = [
  {
    id: "addRowBefore",
    label: "Insert row above",
    icon: ArrowUpToLine,
    run: (editor) => editor.chain().focus().addRowBefore().run(),
  },
  {
    id: "addRowAfter",
    label: "Insert row below",
    icon: ArrowDownToLine,
    run: (editor) => editor.chain().focus().addRowAfter().run(),
  },
  {
    id: "addColumnBefore",
    label: "Insert column left",
    icon: ArrowLeftToLine,
    run: (editor) => editor.chain().focus().addColumnBefore().run(),
  },
  {
    id: "addColumnAfter",
    label: "Insert column right",
    icon: ArrowRightToLine,
    run: (editor) => editor.chain().focus().addColumnAfter().run(),
  },
  {
    id: "toggleHeaderRow",
    label: "Toggle header row",
    icon: Heading,
    run: (editor) => editor.chain().focus().toggleHeaderRow().run(),
  },
  {
    id: "mergeOrSplit",
    label: "Merge or split cells",
    icon: Combine,
    run: (editor) => editor.chain().focus().mergeOrSplit().run(),
  },
  {
    id: "deleteRow",
    label: "Delete row",
    icon: Rows3,
    run: (editor) => editor.chain().focus().deleteRow().run(),
    danger: true,
    undoable: true,
  },
  {
    id: "deleteColumn",
    label: "Delete column",
    icon: Columns3,
    run: (editor) => editor.chain().focus().deleteColumn().run(),
    danger: true,
    undoable: true,
  },
];

/**
 * Row/column controls for the editor's tables. Inserting a table was already possible
 * from the "/" menu, but nothing could reshape one afterwards — this is the only way
 * to add or remove rows and columns.
 *
 * Deleting the whole table isn't here: that's now the hover-revealed block handle
 * (NoteBlockHandle) shared by every block type, not a table-specific action buried
 * among row/column icons.
 *
 * Rendered as a bubble menu rather than a fixed toolbar so it only exists while the
 * caret is actually inside a table.
 */
export function NoteTableMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="noteTableMenu"
      shouldShow={({ editor }) => editor.isEditable && editor.isActive("table")}
      options={{ placement: "top", offset: 8 }}
      className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-md"
    >
      {ACTIONS.map((action) => (
        <Button
          key={action.id}
          type="button"
          variant="ghost"
          size="icon"
          className={
            action.danger
              ? "h-7 w-7 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
              : "h-7 w-7 text-muted-foreground hover:text-foreground"
          }
          title={action.label}
          aria-label={action.label}
          onClick={() => {
            const changed = action.run(editor);
            if (changed && action.undoable) notifyEditorUndo();
          }}
        >
          <action.icon className="h-3.5 w-3.5" />
        </Button>
      ))}
    </BubbleMenu>
  );
}
