/** Minimal TipTap node shape — same walk as the backend's tiptap-text.util.ts. */
interface TipTapNode {
  text?: string;
  content?: TipTapNode[];
}

const MAX_SUMMARY_LENGTH = 160;

/**
 * First ~160 characters of a note's text, for the description a link preview shows in
 * WhatsApp or Slack.
 *
 * Derived here rather than sent by the API: the public DTO is an allow-list, and adding
 * a "summary" field to it would mean publishing a second, differently-shaped copy of the
 * content for no gain — the document is already in hand.
 */
export function extractPublicNoteSummary(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";

  const parts: string[] = [];

  const walk = (node: TipTapNode): void => {
    if (parts.join(" ").length > MAX_SUMMARY_LENGTH) return;
    if (typeof node.text === "string") parts.push(node.text);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };

  walk(doc as TipTapNode);

  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= MAX_SUMMARY_LENGTH) return text;
  return `${text.slice(0, MAX_SUMMARY_LENGTH - 1).trimEnd()}…`;
}
