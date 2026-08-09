"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { GripVertical } from "lucide-react";
import StarterKit from "@tiptap/starter-kit";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { emptyNoteDoc } from "@/notes/domain";
import { SlashCommand } from "@/features/notes/config/slashCommandExtension";
import { NoteImage } from "@/features/notes/config/noteImageExtension";
import { Callout } from "@/features/notes/config/calloutExtension";
import { useNoteImageUpload } from "../hooks/editor/useNoteImageUpload";

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
      TableKit.configure({ table: { resizable: false } }),
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
      {editor && (
        <DragHandle editor={editor}>
          <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
        </DragHandle>
      )}
      <EditorContent editor={editor} />
    </>
  );
}
