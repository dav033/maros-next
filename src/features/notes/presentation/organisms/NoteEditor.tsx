"use client";

import { useState, type FormEvent } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor, Range } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { emptyNoteDoc } from "@/notes/domain";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlashCommand } from "@/features/notes/config/slashCommandExtension";
import { NoteImage } from "@/features/notes/config/noteImageExtension";
import { Callout } from "@/features/notes/config/calloutExtension";
import {
  noteReferenceExtensions,
  type LinkedNoteCreator,
} from "@/features/notes/config/noteReferenceExtensions";
import { useNoteImageUpload } from "../hooks/editor/useNoteImageUpload";
import { NoteBlockHandle } from "./NoteBlockHandle";
import { NoteTableMenu } from "./NoteTableMenu";
import { NoteEditorToolbar } from "./NoteEditorToolbar";

export interface NoteEditorProps {
  pageId: number;
  initialContent: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  editable?: boolean;
  /**
   * Creates the note behind a `[[title]]` that matched nothing. Omitted means `[[` only
   * links to notes that already exist — which is what a read-only editor wants.
   */
  onCreateLinkedNote?: LinkedNoteCreator;
}

/**
 * Uncontrolled by design: initialContent seeds the doc once at mount, onChange streams
 * edits out to the autosave hook. The parent remounts this component (via a `key={pageId}`)
 * when the open page changes, rather than imperatively pushing new content in — feeding
 * query data back into a mounted editor fights the user's cursor mid-edit.
 */
export function NoteEditor({
  pageId,
  initialContent,
  onChange,
  editable = true,
  onCreateLinkedNote,
}: NoteEditorProps) {
  const [imageInsertRequest, setImageInsertRequest] = useState<{
    editor: Editor;
    range: Range;
  } | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlError, setImageUrlError] = useState<string | null>(null);
  const uploadImage = useNoteImageUpload(pageId);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    content:
      initialContent && Object.keys(initialContent).length > 0
        ? initialContent
        : emptyNoteDoc(),
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit.configure({ table: { resizable: true } }),
      NoteImage,
      Callout,
      Placeholder.configure({
        placeholder: "Write something, or press '/' for commands…",
      }),
      SlashCommand.configure({
        requestImageUrl: (currentEditor, range) => {
          setImageUrl("");
          setImageUrlError(null);
          setImageInsertRequest({ editor: currentEditor, range });
        },
      }),
      ...noteReferenceExtensions({ createNote: onCreateLinkedNote }),
    ],
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": "Note content",
        "aria-multiline": "true",
        "aria-readonly": String(!editable),
        // max-w-none, not a prose measure: the measure is set by the page column
        // so the text, the toolbar and a full-width table all share one edge.
        class:
          "note-editor prose prose-invert prose-sm max-w-none focus:outline-none min-h-[50vh] break-words",
      },
      handlePaste: (view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (files.length === 0) return false;
        event.preventDefault();
        for (const file of files) {
          void uploadImage(file).then((key) => {
            if (!key) return;
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({ src: key }),
              ),
            );
          });
        }
        return true;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (files.length === 0) return false;
        event.preventDefault();
        const coords = { left: event.clientX, top: event.clientY };
        const pos = view.posAtCoords(coords)?.pos ?? view.state.selection.from;
        for (const file of files) {
          void uploadImage(file).then((key) => {
            if (!key) return;
            view.dispatch(
              view.state.tr.insert(
                pos,
                view.state.schema.nodes.image.create({ src: key }),
              ),
            );
          });
        }
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  const insertImageFromUrl = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageInsertRequest || imageInsertRequest.editor.isDestroyed) return;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl.trim());
    } catch {
      setImageUrlError("Enter a complete image URL.");
      return;
    }
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      setImageUrlError("Image URLs must use HTTP or HTTPS.");
      return;
    }

    imageInsertRequest.editor
      .chain()
      .focus()
      .deleteRange(imageInsertRequest.range)
      .setImage({ src: parsedUrl.href })
      .run();
    setImageInsertRequest(null);
  };

  return (
    <>
      {editable && editor && <NoteBlockHandle editor={editor} />}
      {editable && editor && <NoteTableMenu editor={editor} />}
      {editable && editor && <NoteEditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
      <Dialog
        open={imageInsertRequest !== null}
        onOpenChange={(open) => {
          if (!open) setImageInsertRequest(null);
        }}
      >
        <DialogContent
          className="max-h-[calc(100svh-1rem)] w-[calc(100%-1rem)] max-w-md p-4 sm:max-h-[calc(100svh-2rem)] sm:p-6"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            editor?.commands.focus();
          }}
        >
          <form onSubmit={insertImageFromUrl} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Insert image</DialogTitle>
              <DialogDescription>
                Add an image from a public HTTP or HTTPS address.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label htmlFor="note-image-url" className="text-sm font-medium">
                Image URL
              </label>
              <Input
                id="note-image-url"
                type="url"
                autoFocus
                required
                value={imageUrl}
                onChange={(event) => {
                  setImageUrl(event.target.value);
                  setImageUrlError(null);
                }}
                placeholder="https://example.com/image.jpg"
                aria-invalid={imageUrlError ? true : undefined}
                aria-describedby={imageUrlError ? "note-image-url-error" : undefined}
              />
              {imageUrlError ? (
                <p id="note-image-url-error" className="text-sm text-destructive" role="alert">
                  {imageUrlError}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setImageInsertRequest(null)}>
                Cancel
              </Button>
              <Button type="submit">Insert image</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {editable && (
        <p className="mt-6 border-t border-line pt-2.5 text-[11px] text-muted-foreground">
          Type / for blocks · @ to reference a record · [[ to link a note · Paste or drop
          images into your note
        </p>
      )}
    </>
  );
}
