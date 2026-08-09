import StarterKit from "@tiptap/starter-kit";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { TableKit } from "@tiptap/extension-table";
import { NoteImage } from "./noteImageExtension";
import { Callout } from "./calloutExtension";

/**
 * The node schema a note document is written in — everything needed to *render* one,
 * and nothing that only makes sense while editing (slash menu, drag handles, upload
 * hooks, placeholder).
 *
 * Shared by the editor and the public reader on purpose. If the two kept their own
 * lists, the first extension added to one would render as a broken block in the other,
 * and the place that would show up is the page customers see.
 *
 * A function rather than a constant: TipTap extensions carry per-editor configuration,
 * so handing two editors the same instances invites one to inherit the other's state.
 */
export function noteRenderExtensions() {
  return [
    StarterKit.configure({
      link: { openOnClick: false, autolink: true },
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    TableKit.configure({ table: { resizable: true } }),
    NoteImage,
    Callout,
  ];
}
