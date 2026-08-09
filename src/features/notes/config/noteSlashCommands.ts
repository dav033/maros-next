import type { Editor, Range } from "@tiptap/core";
import type { LucideIcon } from "lucide-react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Table2,
  Image as ImageIcon,
  Quote,
  Code,
  Minus,
  Type,
  AlertTriangle,
  BellRing,
} from "lucide-react";

export interface NoteSlashCommandItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
  run: (editor: Editor, range: Range) => void;
}

export const NOTE_SLASH_COMMANDS: NoteSlashCommandItem[] = [
  {
    id: "paragraph",
    title: "Text",
    description: "Plain paragraph",
    icon: Type,
    keywords: ["text", "paragraph"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    id: "heading1",
    title: "Heading 1",
    description: "Big section heading",
    icon: Heading1,
    keywords: ["h1", "heading", "title"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
  },
  {
    id: "heading2",
    title: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    keywords: ["h2", "heading", "subtitle"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    id: "heading3",
    title: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    keywords: ["h3", "heading"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    id: "bulletList",
    title: "Bulleted list",
    description: "Simple bullet list",
    icon: List,
    keywords: ["bullet", "list", "ul"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    id: "orderedList",
    title: "Numbered list",
    description: "List with numbering",
    icon: ListOrdered,
    keywords: ["numbered", "list", "ol"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    id: "taskList",
    title: "To-do list",
    description: "Track tasks with checkboxes",
    icon: ListTodo,
    keywords: ["todo", "task", "checkbox"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    id: "table",
    title: "Table",
    description: "3x3 table",
    icon: Table2,
    keywords: ["table", "grid"],
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    id: "image",
    title: "Image",
    description: "Insert an image by URL",
    icon: ImageIcon,
    keywords: ["image", "picture", "photo"],
    run: (editor, range) => {
      const url = window.prompt("Image URL");
      if (!url) return;
      editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
    },
  },
  {
    id: "callout",
    title: "Warning",
    description: "Highlighted note or warning",
    icon: AlertTriangle,
    keywords: ["callout", "notice", "warning", "alert", "advertencia"],
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("callout", { variant: "warning", dueDate: null })
        .run(),
  },
  {
    id: "reminder",
    title: "Reminder",
    description: "Follow-up with a due date",
    icon: BellRing,
    keywords: ["reminder", "due", "follow up", "recordatorio"],
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("callout", { variant: "reminder", dueDate: null })
        .run(),
  },
  {
    id: "blockquote",
    title: "Quote",
    description: "Capture a quote",
    icon: Quote,
    keywords: ["quote", "blockquote"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    id: "codeBlock",
    title: "Code block",
    description: "Monospaced code snippet",
    icon: Code,
    keywords: ["code", "snippet"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    id: "divider",
    title: "Divider",
    description: "Horizontal rule",
    icon: Minus,
    keywords: ["divider", "hr", "line"],
    run: (editor, range) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

export function filterNoteSlashCommands(query: string): NoteSlashCommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return NOTE_SLASH_COMMANDS;
  return NOTE_SLASH_COMMANDS.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.some((keyword) => keyword.includes(q))
  );
}
