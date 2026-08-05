"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { ImageOff, Loader2 } from "lucide-react";
import { useNotePresignedImageUrl } from "../hooks/data/useNotePresignedImageUrl";

/**
 * Node view for image nodes. `node.attrs.src` holds an S3 *key*, never a presigned URL —
 * presigned GETs expire in 1h and the document is persisted indefinitely, so the URL is
 * resolved fresh here at render time instead of being baked into the stored doc.
 */
export function NoteImageView({ node }: NodeViewProps) {
  const src = (node.attrs.src as string) ?? "";
  const alt = (node.attrs.alt as string) ?? "";
  const { url, isLoading } = useNotePresignedImageUrl(src);

  return (
    <NodeViewWrapper className="my-2">
      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center rounded-md border border-border bg-muted/30">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : url ? (
        <img src={url} alt={alt} className="max-w-full rounded-md" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center gap-2 rounded-md border border-border bg-muted/30 text-muted-foreground">
          <ImageOff className="h-5 w-5" />
          <span className="text-sm">Image unavailable</span>
        </div>
      )}
    </NodeViewWrapper>
  );
}
