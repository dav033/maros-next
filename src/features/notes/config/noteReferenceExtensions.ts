import { mergeAttributes } from "@tiptap/core";
import Mention from "@tiptap/extension-mention";
import { ReactNodeViewRenderer, ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";
import {
  NoteReferenceMenuList,
  type NoteReferenceMenuItem,
  type NoteReferenceMenuListHandle,
} from "../presentation/organisms/NoteReferenceMenuList";
import { NoteReferenceChipView } from "../presentation/organisms/NoteReferenceChipView";
import { searchReferenceTargets } from "./referenceTargetSearch";

/**
 * Creates a note from a title typed into a `[[…]]` that matched nothing, and resolves to
 * the new page. Returning null (or being absent) simply means the option is not offered.
 */
export type LinkedNoteCreator = (title: string) => Promise<{ id: number; title: string } | null>;

type ReferenceSuggestion = Omit<SuggestionOptions<NoteReferenceMenuItem>, "editor">;

/**
 * Shared React renderer for both menus — identical to the slash menu's, by design.
 *
 * `loadingRef` is a plain mutable box rather than state: `items()` is an async callback
 * living outside React, and the only thing the menu needs from it is whether a request is
 * still out, read at the moment the menu is (re)rendered.
 */
function suggestionRenderer(loadingRef: { current: boolean }): ReferenceSuggestion["render"] {
  return () => {
    let component: ReactRenderer<NoteReferenceMenuListHandle> | null = null;
    let unmount: (() => void) | null = null;

    return {
      onStart: (props) => {
        component = new ReactRenderer(NoteReferenceMenuList, {
          props: { items: props.items, command: props.command, loading: loadingRef.current },
          editor: props.editor,
        });
        if (!props.clientRect) return;
        unmount = props.mount(component.element);
      },
      onUpdate: (props) => {
        component?.updateProps({
          items: props.items,
          command: props.command,
          loading: loadingRef.current,
        });
      },
      onKeyDown: (props) => {
        if (props.event.key === "Escape") {
          unmount?.();
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false;
      },
      onExit: () => {
        unmount?.();
        component?.destroy();
      },
    };
  };
}

/**
 * The `@` chip: any record in the CRM, inline in a sentence.
 *
 * Extends Mention rather than reusing it, because the app already has a `mention` node for
 * task comments that means "a colleague" and stores only an id. Two node types keep the
 * two meanings apart in stored documents, which matters: the backend reads `entityMention`
 * to build the reference index, and must not try to index every task comment ever written.
 */
export const EntityMention = Mention.extend({
  name: "entityMention",

  addAttributes() {
    return {
      /**
       * Which table `id` points into. Null on a published note — NoteMapper strips targets
       * before a document leaves the building — so the chip view treats it as optional.
       */
      kind: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-reference-kind"),
        renderHTML: (attributes) =>
          attributes.kind ? { "data-reference-kind": attributes.kind as string } : {},
      },
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-reference-id"),
        renderHTML: (attributes) =>
          attributes.id ? { "data-reference-id": String(attributes.id) } : {},
      },
      /**
       * The name as it read when the chip was inserted. Stored, not resolved on read: a
       * document has to stay readable offline, in a published page, and after the record
       * it points at is gone. The live name wins wherever one can be resolved.
       */
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-reference-label"),
        renderHTML: (attributes) =>
          attributes.label ? { "data-reference-label": attributes.label as string } : {},
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ "data-type": "entityMention" }, this.options.HTMLAttributes, HTMLAttributes),
      `@${(node.attrs.label as string | null) ?? ""}`,
    ];
  },

  renderText({ node }) {
    return `@${(node.attrs.label as string | null) ?? ""}`;
  },

  addNodeView() {
    return ReactNodeViewRenderer(NoteReferenceChipView);
  },
});

/**
 * The `[[…]]` wikilink: a pointer to another note, and the offer to create one.
 *
 * A separate node from EntityMention even though a note is a referenceable kind, because
 * the two read differently in prose — `[[Site survey]]` is a sentence's subject, `@Jane` is
 * an aside — and because only this one can create what it links to.
 */
export const NoteLink = EntityMention.extend({
  name: "noteLink",

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ "data-type": "noteLink" }, this.options.HTMLAttributes, HTMLAttributes),
      `[[${(node.attrs.label as string | null) ?? ""}]]`,
    ];
  },

  renderText({ node }) {
    return `[[${(node.attrs.label as string | null) ?? ""}]]`;
  },
});

/** Strips the `]]` someone typed by hand before the menu had a chance to close. */
function cleanWikilinkQuery(query: string): string {
  return query.replace(/]+$/, "").trim();
}

export interface NoteReferenceSuggestionDeps {
  /** Omitted means `[[` only links to notes that already exist. */
  createNote?: LinkedNoteCreator;
}

function buildEntitySuggestion(): ReferenceSuggestion {
  const loading = { current: false };

  return {
    char: "@",
    // Matching only up to the next space: a name is found by one word ("Acme" finds "Acme
    // roof"), and letting the query run to the end of the line would turn "email @ 5pm"
    // into an open menu that swallows the rest of the sentence.
    allowSpaces: false,
    items: async ({ query }) => {
      loading.current = true;
      // Every kind, four each: `@` is the one menu that has to be able to find anything,
      // and a per-kind cap is what stops forty leads burying the single matching contact.
      const targets = await searchReferenceTargets(query.trim(), [], 4);
      loading.current = false;
      return targets.map((target) => ({ type: "target" as const, target }));
    },
    command: ({ editor, range, props }) => {
      if (props.type !== "target") return;
      const { kind, id, label } = props.target;
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          { type: "entityMention", attrs: { kind, id, label } },
          // A trailing space, or the caret sits glued to the pill and the next word is
          // typed into the suggestion range all over again.
          { type: "text", text: " " },
        ])
        .run();
    },
    render: suggestionRenderer(loading),
  };
}

function buildNoteLinkSuggestion(
  deps: NoteReferenceSuggestionDeps
): Omit<SuggestionOptions<NoteReferenceMenuItem>, "editor"> {
  const loading = { current: false };

  const insert = (
    editor: Parameters<NonNullable<SuggestionOptions["command"]>>[0]["editor"],
    range: { from: number; to: number },
    note: { id: number; title: string }
  ) => {
    editor
      .chain()
      .focus()
      .insertContentAt(range, [
        { type: "noteLink", attrs: { kind: "note", id: note.id, label: note.title } },
        { type: "text", text: " " },
      ])
      .run();
  };

  return {
    char: "[[",
    // Note titles have spaces in them, so `[[Site survey` has to stay one query. The
    // trade-off is that the menu stays open to the end of the line; selecting or pressing
    // Escape closes it, as in Obsidian.
    allowSpaces: true,
    items: async ({ query }) => {
      const cleaned = cleanWikilinkQuery(query);
      loading.current = true;
      const targets = await searchReferenceTargets(cleaned, ["note"], 8);
      loading.current = false;

      const items: NoteReferenceMenuItem[] = targets.map((target) => ({
        type: "target" as const,
        target,
      }));

      // Offered only when nothing is an exact title match, so the common case — linking a
      // note that exists — never has a "create a second one with the same name" row under
      // the cursor.
      const exact = targets.some(
        (target) => target.label.toLowerCase() === cleaned.toLowerCase()
      );
      if (deps.createNote && cleaned.length > 0 && !exact) {
        items.push({ type: "create-note", title: cleaned });
      }
      return items;
    },
    command: ({ editor, range, props }) => {
      if (props.type === "target") {
        insert(editor, range, { id: props.target.id, title: props.target.label });
        return;
      }
      if (!deps.createNote) return;

      // The range goes first so the typed `[[title` disappears immediately rather than
      // sitting there while the note is created. The chip is inserted where it was, which
      // is where the caret now is.
      editor.chain().focus().deleteRange(range).run();
      const at = editor.state.selection.from;
      void deps.createNote(props.title).then((note) => {
        if (!note) return;
        insert(editor, { from: at, to: at }, note);
      });
    },
    render: suggestionRenderer(loading),
  };
}

/**
 * Both reference nodes, configured for one editor.
 *
 * A function rather than two constants for the reason noteRenderExtensions gives: TipTap
 * extensions carry per-editor configuration, and the `[[` menu's note creator is different
 * for every note it is opened from.
 */
export function noteReferenceExtensions(deps: NoteReferenceSuggestionDeps = {}) {
  return [
    EntityMention.configure({ suggestion: buildEntitySuggestion() }),
    NoteLink.configure({ suggestion: buildNoteLinkSuggestion(deps) }),
  ];
}

/**
 * The same two nodes with no suggestion plugins — for rendering a document nobody is
 * editing (the public reader, a read-only shared note).
 *
 * The node types must be present or every chip in the document renders as an unknown node,
 * and the place that shows up is the page customers see.
 */
export function noteReferenceRenderExtensions() {
  return [
    EntityMention.configure({ suggestion: { char: "@", items: () => [] } }),
    NoteLink.configure({ suggestion: { char: "[[", items: () => [] } }),
  ];
}
