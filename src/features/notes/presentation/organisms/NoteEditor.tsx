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
import {
  noteReferenceExtensions,
  type LinkedNoteCreator,
} from "@/features/notes/config/noteReferenceExtensions";
import { useNoteImageUpload } from "../hooks/editor/useNoteImageUpload";
import { NoteBlockHandle } from "./NoteBlockHandle";
import { NoteTableMenu } from "./NoteTableMenu";
import { NoteEditorToolbar } from "./NoteEditorToolbar";

export interface NoteEditorProps {
  pageId: number;
  initialContent: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  editable?: boolean;
  /**
   * Creates the note behind a `[[title]]` that matched nothing. Omitted means `[[` only
   * links to notes that already exist — which is what a read-only editor wants.
   */
  onCreateLinkedNote?: LinkedNoteCreator;
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
  onCreateLinkedNote,
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
      ...noteReferenceExtensions({ createNote: onCreateLinkedNote }),
    ],
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": "Note content",
        "aria-multiline": "true",
        "aria-readonly": String(!editable),
        // max-w-none, not a prose measure: the measure is set by the page column
        // so the text, the toolbar and a full-width table all share one edge.
        class:
          "note-editor prose prose-invert prose-sm max-w-none focus:outline-none min-h-[50vh] break-words",
      },
      handlePaste: (view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (files.length === 0) return false;
        event.preventDefault();
        for (const file of files) {
          void uploadImage(file).then((key) => {
            if (!key) return;
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({ src: key }),
              ),
            );
          });
        }
        return true;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (files.length === 0) return false;
        event.preventDefault();
        const coords = { left: event.clientX, top: event.clientY };
        const pos = view.posAtCoords(coords)?.pos ?? view.state.selection.from;
        for (const file of files) {
          void uploadImage(file).then((key) => {
            if (!key) return;
            view.dispatch(
              view.state.tr.insert(
                pos,
                view.state.schema.nodes.image.create({ src: key }),
              ),
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
      {editable && editor && <NoteEditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
      {editable && (
        <p className="mt-6 border-t border-line pt-2.5 text-[11px] text-muted-foreground">
          Type / for blocks · @ to reference a record · [[ to link a note · Paste or drop
          images into your note
        </p>
      )}
    </>
  );
}
