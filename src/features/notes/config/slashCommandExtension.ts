import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import {
  NoteSlashMenuList,
  type NoteSlashMenuListHandle,
} from "@/features/notes/presentation/organisms/NoteSlashMenuList";
import { filterNoteSlashCommands, type NoteSlashCommandItem } from "./noteSlashCommands";

type SlashCommandOptions = {
  requestImageUrl: (editor: Editor, range: Range) => void;
  suggestion: Omit<SuggestionOptions<NoteSlashCommandItem>, "editor">;
};

const suggestionOptions: Omit<SuggestionOptions<NoteSlashCommandItem>, "editor"> = {
  char: "/",
  startOfLine: false,
  items: ({ query }) => filterNoteSlashCommands(query),
  command: ({ editor, range, props }) => {
    props.run?.(editor, range);
  },
  render: () => {
    let component: ReactRenderer<NoteSlashMenuListHandle> | null = null;
    let unmount: (() => void) | null = null;

    return {
      onStart: (props) => {
        component = new ReactRenderer(NoteSlashMenuList, {
          props: { items: props.items, command: props.command },
          editor: props.editor,
        });
        if (!props.clientRect) return;
        unmount = props.mount(component.element);
      },
      onUpdate: (props) => {
        component?.updateProps({ items: props.items, command: props.command });
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
  },
};

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      requestImageUrl: () => undefined,
      suggestion: suggestionOptions,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        command: ({ editor, range, props }) => {
          if (props.id === "image") {
            this.options.requestImageUrl(editor, range);
            return;
          }
          props.run?.(editor, range);
        },
      }),
    ];
  },
});
