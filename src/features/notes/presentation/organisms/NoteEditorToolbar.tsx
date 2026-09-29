"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  ChevronDown,
  Italic,
  List,
  ListOrdered,
  ListTodo,
  Plus,
  Redo2,
  Strikethrough,
  Table2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NOTE_SLASH_COMMANDS } from "@/features/notes/config/noteSlashCommands";
import { NoteTableSizePicker } from "../molecules/NoteTableSizePicker";

/** Handled by their own controls in the toolbar, so they'd be duplicates in "Insert". */
const INSERT_EXCLUDED = [
  "paragraph",
  "heading1",
  "heading2",
  "heading3",
  "bulletList",
  "orderedList",
  "taskList",
  "image",
  "table",
];

export function NoteEditorToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      strike: current.isActive("strike"),
      bulletList: current.isActive("bulletList"),
      orderedList: current.isActive("orderedList"),
      taskList: current.isActive("taskList"),
      heading:
        [1, 2, 3].find((level) => current.isActive("heading", { level })) ?? 0,
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    }),
  });
  const formats = [
    {
      label: "Bold",
      icon: Bold,
      active: state.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      active: state.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Strikethrough",
      icon: Strikethrough,
      active: state.strike,
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      label: "Bulleted list",
      icon: List,
      active: state.bulletList,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: state.orderedList,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "To-do list",
      icon: ListTodo,
      active: state.taskList,
      run: () => editor.chain().focus().toggleTaskList().run(),
    },
  ];
  return (
    <TooltipProvider delayDuration={350}>
      <div
        role="group"
        aria-label="Text formatting"
        className="sticky top-0 z-10 mb-3 flex flex-wrap items-center gap-0.5 rounded-md border border-line bg-elev-2 px-1.5 py-1"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mr-1 h-7 min-w-20 justify-between px-2 text-xs"
              aria-label="Text style"
            >
              {state.heading ? `Heading ${state.heading}` : "Text"}
              <ChevronDown className="size-3" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onSelect={() => editor.chain().focus().setParagraph().run()}
            >
              Text
            </DropdownMenuItem>
            {([1, 2, 3] as const).map((level) => (
              <DropdownMenuItem
                key={level}
                onSelect={() =>
                  editor.chain().focus().setHeading({ level }).run()
                }
              >
                Heading {level}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {formats.map(({ label, icon: Icon, active, run }, index) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={label}
                aria-pressed={active}
                className={cn(
                  "size-7 text-muted-foreground",
                  active && "bg-elev-4 text-foreground",
                  index === 3 && "ml-1.5",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={run}
              >
                <Icon className="size-3.5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
        <NoteTableSizePicker
          onInsert={(rows, cols) =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: rows + 1, cols, withHeaderRow: true })
              .run()
          }
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-1.5 size-7 text-muted-foreground"
              aria-label="Insert table"
              title="Insert table"
              onMouseDown={(event) => event.preventDefault()}
            >
              <Table2 className="size-3.5" aria-hidden="true" />
            </Button>
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-0.5 h-7 gap-1 px-2 text-xs text-muted-foreground"
            >
              <Plus className="size-3.5" aria-hidden="true" /> Insert{" "}
              <ChevronDown className="size-3" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {NOTE_SLASH_COMMANDS.filter(
              (command) => !INSERT_EXCLUDED.includes(command.id),
            ).map((command) => (
              <DropdownMenuItem
                key={command.id}
                onSelect={() => {
                  const pos = editor.state.selection.from;
                  command.run(editor, { from: pos, to: pos });
                }}
              >
                <command.icon className="mr-2 size-4" aria-hidden="true" />
                {command.title}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              Paste or drop an image to upload
            </p>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="ml-auto flex gap-0.5">
          {[
            {
              label: "Undo",
              icon: Undo2,
              disabled: !state.canUndo,
              run: () => editor.chain().focus().undo().run(),
            },
            {
              label: "Redo",
              icon: Redo2,
              disabled: !state.canRedo,
              run: () => editor.chain().focus().redo().run(),
            },
          ].map(({ label, icon: Icon, disabled, run }) => (
            <Button
              key={label}
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground"
              aria-label={label}
              title={label}
              disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={run}
            >
              <Icon className="size-3.5" aria-hidden="true" />
            </Button>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
