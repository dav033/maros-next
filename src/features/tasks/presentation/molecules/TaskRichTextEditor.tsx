"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Placeholder } from "@tiptap/extensions";
import { Bold, Italic, Link2, List, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskMention } from "../../config/taskMentionExtension";
import { isEmptyDoc } from "./taskRichTextDoc";

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      // Losing editor focus on click would close the toolbar's own target (a
      // selection) before the command runs — this keeps focus in the document.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground",
        active && "bg-accent text-foreground"
      )}
    >
      {children}
    </button>
  );
}

/**
 * The compact editor for a task's description and its comments — a small slice of
 * NoteEditor's toolbar (bold, italic, two list types, link), not notes' full set
 * (tables, callouts, slash commands, image drop): a task description doesn't need
 * headings or embedded tables. See PLAN-TAREAS-V2.md §4.1.
 *
 * Uncontrolled by design, same as NoteEditor: `content` seeds the doc once at mount,
 * `onSave` fires on blur with the latest JSON. The parent remounts via `key` (task id,
 * or comment id while editing) when the underlying record changes, rather than this
 * component re-syncing content on every prop change — pushing fresh query data into a
 * mounted editor fights whatever the user is mid-typing.
 */
export function TaskRichTextEditor({
  content,
  onSave,
  onUpdate,
  placeholder = "Add details…",
  editable = true,
  mentionable = false,
  minHeightClassName = "min-h-[100px]",
  autoFocus = false,
}: {
  content: Record<string, unknown> | null | undefined;
  /** Fires on blur — the "persist this" signal, for fields saved implicitly (description, an in-progress comment edit). */
  onSave?: (doc: Record<string, unknown>) => void;
  /** Fires on every change — for callers that need live content (e.g. the comment composer enabling its Submit button), not just the on-blur save. */
  onUpdate?: (doc: Record<string, unknown>) => void;
  placeholder?: string;
  editable?: boolean;
  /** Comments support @mentions; the description deliberately doesn't (see §4.2 — mentions are for pulling someone into a thread, which only comments have). */
  mentionable?: boolean;
  minHeightClassName?: string;
  autoFocus?: boolean;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    autofocus: autoFocus,
    content: isEmptyDoc(content) ? { type: "doc", content: [{ type: "paragraph" }] } : content,
    extensions: [
      StarterKit.configure({
        heading: false,
        link: { openOnClick: false, autolink: true },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
      ...(mentionable ? [TaskMention] : []),
    ],
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
          minHeightClassName
        ),
      },
    },
    onBlur: ({ editor }) => {
      onSave?.(editor.getJSON());
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getJSON());
    },
  });

  if (!editor) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-transparent",
        editable && "focus-within:ring-1 focus-within:ring-ring"
      )}
    >
      {editable ? (
        <div className="flex items-center gap-0.5 border-b border-border/60 px-1.5 py-1">
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Bulleted list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Checklist"
            active={editor.isActive("taskList")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            <ListChecks className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Link"
            active={editor.isActive("link")}
            onClick={() => {
              const previousUrl = editor.getAttributes("link").href as string | undefined;
              const url = window.prompt("Link URL", previousUrl ?? "");
              if (url === null) return;
              if (url === "") {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                return;
              }
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            }}
          >
            <Link2 className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>
      ) : null}
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
