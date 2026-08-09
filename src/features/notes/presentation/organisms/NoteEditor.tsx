"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { emptyNoteDoc } from "@/notes/domain";
import { SlashCommand } from "@/features/notes/config/slashCommandExtension";
import { NoteImage } from "@/features/notes/config/noteImageExtension";
import { Callout } from "@/features/notes/config/calloutExtension";
import { NOTE_SLASH_COMMANDS } from "@/features/notes/config/noteSlashCommands";
import { useNoteImageUpload } from "../hooks/editor/useNoteImageUpload";
import { NoteBlockHandle } from "./NoteBlockHandle";
import { NoteTableMenu } from "./NoteTableMenu";
import { Button } from "@/components/ui/button";

// A few of the "/" menu's commands, surfaced as one-click buttons too, since not
// every user thinks to type "/" to discover them.
const QUICK_INSERT_IDS = ["table", "taskList", "callout", "reminder"];
const QUICK_INSERT_COMMANDS = NOTE_SLASH_COMMANDS.filter((cmd) =>
  QUICK_INSERT_IDS.includes(cmd.id)
);

export interface NoteEditorProps {
  pageId: number;
  initialContent: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  editable?: boolean;
}

/**
 * Uncontrolled by design: initialContent seeds the doc once at mount, onChange streams
 * edits out to the autosave hook. The parent remounts this component (via a `key={pageId}`)
 * when the open page changes, rather than imperatively pushing new content in — feeding
 * query data back into a mounted editor fights the user's cursor mid-edit.
 */
export function NoteEditor({
  pageId,
  initialContent,
  onChange,
  editable = true,
}: NoteEditorProps) {
  const uploadImage = useNoteImageUpload(pageId);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    content:
      initialContent && Object.keys(initialContent).length > 0
        ? initialContent
        : emptyNoteDoc(),
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit.configure({ table: { resizable: true } }),
      NoteImage,
      Callout,
      Placeholder.configure({
        placeholder: "Write something, or press '/' for commands…",
      }),
      SlashCommand,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[60vh]",
      },
      handlePaste: (view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
          f.type.startsWith("image/")
        );
        if (files.length === 0) return false;
        event.preventDefault();
        for (const file of files) {
          void uploadImage(file).then((key) => {
            if (!key) return;
            view.dispatch(view.state.tr.replaceSelectionWith(
              view.state.schema.nodes.image.create({ src: key })
            ));
          });
        }
        return true;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
          f.type.startsWith("image/")
        );
        if (files.length === 0) return false;
        event.preventDefault();
        const coords = { left: event.clientX, top: event.clientY };
        const pos = view.posAtCoords(coords)?.pos ?? view.state.selection.from;
        for (const file of files) {
          void uploadImage(file).then((key) => {
            if (!key) return;
            view.dispatch(
              view.state.tr.insert(pos, view.state.schema.nodes.image.create({ src: key }))
            );
          });
        }
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  return (
    <>
      {editable && editor && <NoteBlockHandle editor={editor} />}
      {editable && editor && <NoteTableMenu editor={editor} />}
      {editable && editor && (
        <div className="mb-4 flex items-center gap-1 border-b border-border/60 pb-3">
          {QUICK_INSERT_COMMANDS.map((cmd) => (
            <Button
              key={cmd.id}
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                const pos = editor.state.selection.from;
                cmd.run(editor, { from: pos, to: pos });
              }}
            >
              <cmd.icon className="h-3.5 w-3.5" />
              {cmd.title}
            </Button>
          ))}
        </div>
      )}
      <EditorContent editor={editor} />
    </>
  );
}
