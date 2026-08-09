import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { AlertTriangle } from "lucide-react";

export function NoteCalloutView() {
  return (
    <NodeViewWrapper
      data-type="callout"
      className="my-2 flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 px-4 py-3.5"
    >
      <span className="mt-0.5 shrink-0 text-amber-400">
        <AlertTriangle className="h-4 w-4" />
      </span>
      <NodeViewContent className="flex-1 text-[13.5px] leading-relaxed text-foreground/85" />
    </NodeViewWrapper>
  );
}
