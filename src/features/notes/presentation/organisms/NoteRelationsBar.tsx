"use client";

import Link from "next/link";
import { Link2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NOTE_REFERENCE_KIND_LABELS,
  noteReferenceHref,
  type NoteReference,
} from "@/notes/domain";
import {
  NOTE_REFERENCE_CHIP_CLASSES,
  NOTE_REFERENCE_ICONS,
} from "../atoms/noteReferenceVisuals";
import { NoteReferenceTargetPicker } from "../molecules/NoteReferenceTargetPicker";
import { useNoteReferences } from "../hooks/data/useNoteReferences";
import { useNoteReferenceMutations } from "../hooks/mutations/useNoteReferenceMutations";

/**
 * The records a note is pinned to, as removable chips in its header, plus the records its
 * body merely mentions.
 *
 * Both are shown, visually distinguished, because they answer different questions: the
 * pinned ones are "what is this note about" (and are what puts it in a lead's Notes panel),
 * the mentioned ones are "what came up while writing it". Hiding the second group would
 * make the index invisible and leave people wondering why a note turned up under a lead.
 *
 * Replaces the single "Link a record" chip. That link still exists — it is the primary
 * relation, the first pinned record — but it is no longer the only one a note can have.
 */
export function NoteRelationsBar({
  pageId,
  canEdit,
}: {
  pageId: number;
  canEdit: boolean;
}) {
  const { references } = useNoteReferences(pageId);
  const { addRelationMutation, removeRelationMutation } = useNoteReferenceMutations();

  const relations = references.filter((reference) => reference.origin === "relation");
  const mentions = references.filter((reference) => reference.origin === "inline");

  return (
    <>
      {relations.map((reference) => (
        <ReferenceChip
          key={`relation-${reference.kind}-${reference.id}`}
          reference={reference}
          onRemove={
            canEdit
              ? () =>
                  removeRelationMutation.mutate({
                    pageId,
                    kind: reference.kind,
                    targetId: reference.id,
                  })
              : undefined
          }
        />
      ))}

      {canEdit && (
        <NoteReferenceTargetPicker
          excluded={relations.map((reference) => ({
            kind: reference.kind,
            id: reference.id,
          }))}
          onSelect={(target) =>
            addRelationMutation.mutate({ pageId, kind: target.kind, targetId: target.id })
          }
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-line-strong px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-solid hover:bg-elev-4 hover:text-foreground"
            >
              <Plus className="size-3" aria-hidden="true" />
              Link a record
            </button>
          }
        />
      )}

      {mentions.length > 0 && (
        <span
          className="inline-flex items-center gap-1.5"
          title="Mentioned in the body of this note"
        >
          <Link2 className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
          {mentions.map((reference) => (
            <ReferenceChip
              key={`mention-${reference.kind}-${reference.id}`}
              reference={reference}
              // No remove button: an inline mention is part of the text. Deleting it here
              // would leave the chip in the document and the next autosave would write the
              // reference straight back.
              muted
            />
          ))}
        </span>
      )}
    </>
  );
}

function ReferenceChip({
  reference,
  onRemove,
  muted = false,
}: {
  reference: NoteReference;
  onRemove?: () => void;
  muted?: boolean;
}) {
  const Icon = NOTE_REFERENCE_ICONS[reference.kind];
  const href = noteReferenceHref(reference.kind, reference.id);
  const kindLabel = NOTE_REFERENCE_KIND_LABELS[reference.kind];

  const label = (
    <span
      className={cn("max-w-[14rem] truncate", !reference.exists && "italic opacity-70")}
      // A reference whose record was deleted keeps the name it had, because "Acme roof
      // (deleted)" tells someone what used to be there and a blank pill does not.
      title={reference.exists ? `${kindLabel}: ${reference.label}` : `${kindLabel} was deleted`}
    >
      {reference.exists ? reference.label : `${reference.label} (deleted)`}
    </span>
  );

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md py-0.5 pl-2 text-[11px]",
        onRemove ? "pr-1" : "pr-2",
        muted ? "bg-elev-4 text-muted-foreground" : NOTE_REFERENCE_CHIP_CLASSES[reference.kind]
      )}
    >
      <Icon className="size-3 shrink-0 opacity-80" aria-hidden="true" />
      {href && reference.exists ? (
        <Link href={href} className="max-w-[14rem] truncate hover:underline">
          {label}
        </Link>
      ) : (
        label
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title={`Unlink this ${kindLabel.toLowerCase()}`}
          aria-label={`Unlink ${reference.label}`}
          className="rounded p-0.5 opacity-70 transition-opacity hover:bg-elev-5 hover:opacity-100"
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
