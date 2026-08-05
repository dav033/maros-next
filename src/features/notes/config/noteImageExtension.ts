import { Image } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NoteImageView } from "@/features/notes/presentation/organisms/NoteImageView";

/** Same schema as the stock Image extension; only the rendering (node view) changes. */
export const NoteImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(NoteImageView);
  },
});
