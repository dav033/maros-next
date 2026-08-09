interface TipTapNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
}

export interface NoteTocEntry {
  id: string;
  text: string;
  level: number;
}

/**
 * Table of contents for a note, built from the document JSON rather than from the
 * rendered DOM.
 *
 * Reading the DOM would mean waiting for TipTap to mount and would not work at all
 * during server rendering, which is exactly where the public reader needs it. The
 * trade-off is that the anchor ids have to be derived the same way in both places —
 * hence `slugForHeading`, used by the renderer too.
 */
export function buildNoteToc(doc: unknown): NoteTocEntry[] {
  if (!doc || typeof doc !== "object") return [];

  const entries: NoteTocEntry[] = [];
  const used = new Map<string, number>();

  const walk = (node: TipTapNode): void => {
    if (node.type === "heading") {
      const text = collectText(node).trim();
      const level = Number(node.attrs?.level ?? 1);
      if (text) {
        entries.push({ id: uniqueSlug(text, used), text, level });
      }
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };

  walk(doc as TipTapNode);
  return entries;
}

function collectText(node: TipTapNode): string {
  if (typeof node.text === "string") return node.text;
  if (!Array.isArray(node.content)) return "";
  return node.content.map(collectText).join("");
}

export function slugForHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      // Strip accents so "Instalación" and "Instalacion" produce the same anchor.
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/** Two headings with the same words still need two distinct anchors. */
function uniqueSlug(text: string, used: Map<string, number>): string {
  const base = slugForHeading(text);
  const seen = used.get(base) ?? 0;
  used.set(base, seen + 1);
  return seen === 0 ? base : `${base}-${seen + 1}`;
}
