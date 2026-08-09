import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NoteCalloutView } from "@/features/notes/presentation/organisms/NoteCalloutView";

export const CALLOUT_VARIANTS = ["note", "warning", "reminder"] as const;
export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

export function isCalloutVariant(value: unknown): value is CalloutVariant {
  return CALLOUT_VARIANTS.includes(value as CalloutVariant);
}

/**
 * A single-paragraph highlighted box.
 *
 * `variant` defaults to "warning" because that is exactly how every callout written
 * before variants existed renders — those documents have no attribute to read, so the
 * default has to match what they already looked like.
 *
 * `dueDate` only means anything for the reminder variant: an ISO date (no time; a
 * site reminder is a day, not a minute) that the node view flags once it's past.
 */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "warning" as CalloutVariant,
        parseHTML: (element) => {
          const value = element.getAttribute("data-variant");
          return isCalloutVariant(value) ? value : "warning";
        },
        renderHTML: (attributes) => ({ "data-variant": attributes.variant as string }),
      },
      dueDate: {
        default: null as string | null,
        parseHTML: (element) => element.getAttribute("data-due-date"),
        renderHTML: (attributes) =>
          attributes.dueDate ? { "data-due-date": attributes.dueDate as string } : {},
      },
    };
  },

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
