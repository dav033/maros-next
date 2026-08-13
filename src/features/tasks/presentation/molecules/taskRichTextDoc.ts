/** True for `null`/`undefined`/`{}` — what a brand-new task's description arrives as. */
export function isEmptyDoc(doc: Record<string, unknown> | null | undefined): boolean {
  if (!doc || typeof doc !== "object") return true;
  const content = (doc as { content?: unknown[] }).content;
  return !Array.isArray(content) || content.length === 0;
}

/**
 * True when every block is present but carries no inline content — the shape TipTap
 * reports for "an empty paragraph, nothing typed" rather than a genuinely empty doc.
 * Used to gate the comment composer's submit button.
 */
export function isBlankDoc(doc: Record<string, unknown> | null | undefined): boolean {
  if (isEmptyDoc(doc)) return true;
  const content = (doc as { content?: Array<{ content?: unknown[] }> }).content ?? [];
  return content.every((node) => !node.content || node.content.length === 0);
}
