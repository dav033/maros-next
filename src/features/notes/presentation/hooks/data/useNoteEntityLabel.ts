"use client";

import { useInstantContacts } from "@/features/contact/presentation/hooks";
import { useInstantCompanies } from "@/features/company/presentation/hooks";
import type { NoteEntityKind } from "@/notes/domain";
import { useNoteLinkableRecords } from "./useNoteLinkableRecords";

export type NoteEntityLabel = {
  /** Human name for the chip, or null while the lists are still loading. */
  label: string | null;
  /** Where the chip should link to, or null for kinds without a detail route here. */
  href: string | null;
};

/**
 * Resolves a note's entity link into something worth showing.
 *
 * Reuses the same cached lists the picker uses, so opening a linked note right after
 * using the picker costs nothing. Nothing is fetched when the note has no link.
 */
export function useNoteEntityLabel(
  entityKind: NoteEntityKind | null,
  entityId: number | null,
): NoteEntityLabel {
  const linked = entityKind != null && entityId != null;
  const { leads, projects } = useNoteLinkableRecords(
    linked && (entityKind === "lead" || entityKind === "project"),
  );
  const { contacts } = useInstantContacts(undefined, {
    enabled: linked && entityKind === "contact",
  });
  const { companies } = useInstantCompanies(undefined, {
    enabled: linked && entityKind === "company",
  });

  if (!linked) return { label: null, href: null };

  if (entityKind === "lead") {
    const lead = leads?.find((item) => item.id === entityId);
    return {
      label: lead ? lead.name : null,
      href: `/lead/${entityId}`,
    };
  }

  if (entityKind === "project") {
    const project = projects?.find((item) => item.id === entityId);
    return {
      label: project?.name ?? null,
      href: `/project/${entityId}`,
    };
  }

  if (entityKind === "contact") {
    const contact = contacts?.find((item) => item.id === entityId);
    return { label: contact?.name ?? null, href: `/contact/${entityId}` };
  }

  if (entityKind === "company") {
    const company = companies?.find((item) => item.id === entityId);
    return { label: company?.name ?? null, href: `/company/${entityId}` };
  }

  return { label: null, href: null };
}
