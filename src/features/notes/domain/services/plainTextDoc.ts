/**
 * Bridges plain text and a minimal-but-valid TipTap document, so the Phase 3 textarea
 * placeholder writes documents the real TipTap editor (added later) can open unmodified.
 */
export function textToNoteDoc(text: string): Record<string, unknown> {
  const paragraphs = text.split("\n");
  return {
    type: "doc",
    content: paragraphs.map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : [],
    })),
  };
}

interface DocNode {
  type?: string;
  text?: string;
  content?: DocNode[];
}

export function noteDocToText(doc: Record<string, unknown> | null | undefined): string {
  const root = doc as DocNode | null | undefined;
  if (!root?.content) return "";

  return root.content
    .map((block) => (block.content ?? []).map((n) => n.text ?? "").join(""))
    .join("\n");
}
