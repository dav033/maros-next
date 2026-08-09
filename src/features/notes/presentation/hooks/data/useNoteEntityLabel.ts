"use client";

import { useInstantLeads } from "@/features/leads/presentation/hooks/data/useInstantLeads";
import { useInstantProjects } from "@/features/project/presentation/hooks/data/useInstantProjects";
import type { NoteEntityKind } from "@/notes/domain";

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
  const { leads } = useInstantLeads(undefined, { enabled: linked && entityKind === "lead" });
  const { projects } = useInstantProjects(undefined, {
    enabled: linked && entityKind === "project",
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
      label: project ? (project.lead?.name ?? `Project ${entityId}`) : null,
      href: `/project/${entityId}`,
    };
  }

  // Contacts and companies can still hold a link (notes created from their detail
  // pages), but this workspace has no picker for them — show the kind, not a name.
  return { label: `${entityKind} #${entityId}`, href: null };
}
