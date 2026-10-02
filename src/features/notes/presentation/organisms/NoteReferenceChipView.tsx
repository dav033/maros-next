"use client";

import Link from "next/link";
import { Link2 } from "lucide-react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  NOTE_REFERENCE_KIND_LABELS,
  noteReferenceHref,
  type NoteReferenceKind,
} from "@/notes/domain";
import {
  NOTE_REFERENCE_CHIP_CLASSES,
  NOTE_REFERENCE_ICONS,
} from "../atoms/noteReferenceVisuals";

const CHIP_BASE =
  "inline-flex max-w-[20rem] items-center gap-1 rounded-md px-1.5 py-px align-baseline text-[0.95em] font-medium leading-snug no-underline not-prose";

/** Neutral tint for a chip whose target was stripped — see below. */
const ANONYMOUS_CHIP_CLASS = "bg-elev-4 text-foreground/80";

type ChipAttrs = {
  kind: NoteReferenceKind | null;
  id: number | null;
  label: string | null;
};

/**
 * Reads the chip's attributes defensively.
 *
 * `kind` and `id` are both null on a published note: NoteMapper strips every reference
 * target before a document goes to the internet, leaving only the label. A chip in that
 * state must not be *guessed* at — rendering an unknown kind with the lead icon would put a
 * briefcase next to a colleague's name on the page customers see. It renders neutral
 * instead, which is honest about knowing only the text.
 */
function readAttrs(node: NodeViewProps["node"]): ChipAttrs {
  const raw = node.attrs as { kind?: unknown; id?: unknown; label?: unknown };
  const kind =
    typeof raw.kind === "string" && raw.kind in NOTE_REFERENCE_ICONS
      ? (raw.kind as NoteReferenceKind)
      : null;
  const id = Number(raw.id);
  const label = typeof raw.label === "string" && raw.label.trim() ? raw.label.trim() : null;
  return { kind, id: Number.isInteger(id) && id > 0 ? id : null, label };
}

/**
 * How a referenced record reads inside a paragraph: a tinted pill with its kind's icon.
 *
 * A node view rather than plain renderHTML output, so the icon is a real component and the
 * link is a Next `Link` — a full page reload on every chip would make a note full of
 * references slower to walk than the sidebar it replaces.
 */
export function NoteReferenceChipView({ node }: NodeViewProps) {
  const { kind, id, label } = readAttrs(node);
  const Icon = kind ? NOTE_REFERENCE_ICONS[kind] : Link2;
  const href = kind && id ? noteReferenceHref(kind, id) : null;
  const text = label ?? (kind && id ? `${NOTE_REFERENCE_KIND_LABELS[kind]} #${id}` : "Reference");
  const tooltip = kind ? `${NOTE_REFERENCE_KIND_LABELS[kind]}: ${text}` : text;

  const body = (
    <>
      <Icon className="size-3 shrink-0 opacity-70" aria-hidden="true" />
      <span className="truncate">{text}</span>
    </>
  );

  const chipClass = cn(CHIP_BASE, kind ? NOTE_REFERENCE_CHIP_CLASSES[kind] : ANONYMOUS_CHIP_CLASS);

  return (
    // contentEditable={false} keeps the caret from landing inside the pill; the wrapper is
    // a span because a div here would break the line the sentence sits on.
    <NodeViewWrapper as="span" contentEditable={false} className="not-prose">
      {href ? (
        <Link
          href={href}
          // The editor owns click handling inside the document, so the navigation has to
          // be claimed explicitly or ProseMirror places a cursor instead of following it.
          onClick={(event) => event.stopPropagation()}
          title={tooltip}
          className={cn(chipClass, "transition-opacity hover:opacity-80")}
        >
          {body}
        </Link>
      ) : (
        <span title={tooltip} className={chipClass}>
          {body}
        </span>
      )}
    </NodeViewWrapper>
  );
}
