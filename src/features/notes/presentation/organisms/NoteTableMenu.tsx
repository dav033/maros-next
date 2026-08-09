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
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type TableAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  run: (editor: Editor) => void;
  /** Destructive actions get the red hover treatment. */
  danger?: boolean;
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
  },
  {
    id: "deleteColumn",
    label: "Delete column",
    icon: Columns3,
    run: (editor) => editor.chain().focus().deleteColumn().run(),
    danger: true,
  },
  {
    id: "deleteTable",
    label: "Delete table",
    icon: Trash2,
    run: (editor) => editor.chain().focus().deleteTable().run(),
    danger: true,
  },
];

/**
 * Row/column controls for the editor's tables. Inserting a table was already possible
 * from the "/" menu, but nothing could reshape one afterwards — this is the only way
 * to add or remove rows and columns.
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
          onClick={() => action.run(editor)}
        >
          <action.icon className="h-3.5 w-3.5" />
        </Button>
      ))}
    </BubbleMenu>
  );
}
