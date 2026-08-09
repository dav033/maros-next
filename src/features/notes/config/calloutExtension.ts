import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NoteCalloutView } from "@/features/notes/presentation/organisms/NoteCalloutView";

/**
 * A single-paragraph highlighted box (the mockup's amber "note" callout).
 * A textblock like `paragraph`/`heading`, so the built-in `setNode` command
 * can toggle a block into/out of it.
 */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "inline*",
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, "data-type": "callout" }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(NoteCalloutView);
  },
});
