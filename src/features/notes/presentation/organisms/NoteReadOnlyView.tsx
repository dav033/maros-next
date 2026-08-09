"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { emptyNoteDoc } from "@/notes/domain";
import { noteRenderExtensions } from "@/features/notes/config/noteRenderExtensions";

export interface NoteReadOnlyViewProps {
  content: Record<string, unknown>;
}

/**
 * Renders a note document without any of the editing machinery.
 *
 * Deliberately not `<NoteEditor editable={false} />`. That component pulls in the slash
 * menu, the drag handles, the table toolbar and an image-upload hook that calls
 * authenticated server actions — all of it dead weight on the one page served to the
 * open internet, and all of it surface that does not need to exist there.
 *
 * The node schema itself is shared (noteRenderExtensions), so a callout or a table
 * looks the same inside the CRM and outside it.
 */
export function NoteReadOnlyView({ content }: NoteReadOnlyViewProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    content: content && Object.keys(content).length > 0 ? content : emptyNoteDoc(),
    extensions: noteRenderExtensions(),
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none",
      },
    },
  });

  return <EditorContent editor={editor} />;
}
