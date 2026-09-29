"use client";

import type { Editor } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Combine,
  PanelLeft,
  PanelTop,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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

/**
 * Three groups, each behind its own written label.
 *
 * The previous bar was eight bare icons in a row, where "delete row" and "delete
 * column" were two near-identical grids and the only way to tell an insert-above
 * from an insert-left was to read the arrow's angle. Grouping under "Row" / "Column"
 * makes the axis explicit, so each icon only has to carry a direction.
 */
const GROUPS: { id: string; label: string; actions: TableAction[] }[] = [
  {
    id: "row",
    label: "Row",
    actions: [
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
        id: "deleteRow",
        label: "Delete row",
        icon: Trash2,
        run: (editor) => editor.chain().focus().deleteRow().run(),
        danger: true,
        undoable: true,
      },
    ],
  },
  {
    id: "column",
    label: "Column",
    actions: [
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
        id: "deleteColumn",
        label: "Delete column",
        icon: Trash2,
        run: (editor) => editor.chain().focus().deleteColumn().run(),
        danger: true,
        undoable: true,
      },
    ],
  },
  {
    id: "table",
    label: "Table",
    actions: [
      {
        id: "toggleHeaderRow",
        label: "Toggle header row",
        icon: PanelTop,
        run: (editor) => editor.chain().focus().toggleHeaderRow().run(),
      },
      {
        id: "toggleHeaderColumn",
        label: "Toggle header column",
        icon: PanelLeft,
        run: (editor) => editor.chain().focus().toggleHeaderColumn().run(),
      },
      {
        id: "mergeOrSplit",
        label: "Merge or split cells",
        icon: Combine,
        run: (editor) => editor.chain().focus().mergeOrSplit().run(),
      },
      {
        id: "deleteTable",
        label: "Delete table",
        icon: Trash2,
        run: (editor) => editor.chain().focus().deleteTable().run(),
        danger: true,
        undoable: true,
      },
    ],
  },
];

/**
 * Row/column controls for the editor's tables. Inserting a table was already possible
 * from the "/" menu and the toolbar's size picker, but nothing could reshape one
 * afterwards — this is the only way to add or remove rows and columns.
 *
 * Rendered as a bubble menu rather than a fixed toolbar so it only exists while the
 * caret is actually inside a table. It anchors to the top of the selection and is
 * allowed to flip, so it never sits on the cell being edited.
 */
export function NoteTableMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="noteTableMenu"
      shouldShow={({ editor }) => editor.isEditable && editor.isActive("table")}
      options={{ placement: "top-start", offset: 10 }}
      className="flex items-center gap-1 rounded-lg border border-line bg-elev-5 px-1.5 py-1 shadow-lg shadow-black/40"
    >
      {GROUPS.map((group, groupIndex) => (
        <div key={group.id} className="flex items-center gap-0.5">
          {groupIndex > 0 && (
            <span
              aria-hidden="true"
              className="mx-1 h-5 w-px shrink-0 bg-line"
            />
          )}
          <span className="select-none pr-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </span>
          {group.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                action.danger
                  ? "hover:bg-destructive/15 hover:text-destructive"
                  : "hover:bg-elev-3 hover:text-foreground",
              )}
              title={action.label}
              aria-label={action.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                const changed = action.run(editor);
                if (changed && action.undoable) notifyEditorUndo();
              }}
            >
              <action.icon className="size-3.5" aria-hidden="true" />
            </button>
          ))}
        </div>
      ))}
    </BubbleMenu>
  );
}
