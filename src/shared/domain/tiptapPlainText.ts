/**
 * Bridges plain text and a minimal-but-valid TipTap document — for editors that only
 * need a plain textarea today (a task description, a comment) but write into the same
 * `jsonb` column shape a real TipTap editor would, so no data migration is needed if
 * one replaces the textarea later.
 */
export function textToTipTapDoc(text: string): Record<string, unknown> {
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

export function tiptapDocToText(doc: Record<string, unknown> | null | undefined): string {
  const root = doc as DocNode | null | undefined;
  if (!root?.content) return "";

  return root.content
    .map((block) => (block.content ?? []).map((n) => n.text ?? "").join(""))
    .join("\n");
}
