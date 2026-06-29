"use client";

import { useMemo } from "react";
import type {
  QboAttachment,
  QboAttachmentByEntity,
  QboAttachmentEntityType,
  QboProjectAttachments,
} from "../../domain/models";
import { getAllEntityTypeOrder, getEntityTypeMeta } from "../utils/entityTypeMeta";

export interface QboAttachmentSection {
  entityType: string;
  label: string;
  description: string;
  icon: QboEntityTypeIcon;
  attachments: QboAttachment[];
  fallbackUsed: boolean;
}

export interface QboAttachmentsGrouped {
  sections: QboAttachmentSection[];
  total: number;
  isEmpty: boolean;
}

type QboEntityTypeIcon = ReturnType<typeof getEntityTypeMeta>["icon"];

export type QboAttachmentIcon = QboEntityTypeIcon;

function compareEntityType(
  entityType: string,
  order: readonly QboAttachmentEntityType[],
  known: ReadonlySet<string>,
): number {
  if (!known.has(entityType)) return Number.MAX_SAFE_INTEGER;
  return order.indexOf(entityType as QboAttachmentEntityType);
}

function dedupeAttachments(attachments: QboAttachment[]): QboAttachment[] {
  const seen = new Map<string, QboAttachment>();
  for (const a of attachments) {
    if (!seen.has(a.attachmentId)) {
      seen.set(a.attachmentId, a);
    }
  }
  return Array.from(seen.values());
}

function buildSectionsFromByEntity(
  byEntity: QboAttachmentByEntity[],
): QboAttachmentSection[] {
  const order = getAllEntityTypeOrder();
  const known = new Set<string>(order);
  const grouped = new Map<
    string,
    { attachments: QboAttachment[]; fallbackUsed: boolean }
  >();

  for (const group of byEntity) {
    const bucket = grouped.get(group.entityType) ?? {
      attachments: [],
      fallbackUsed: false,
    };
    bucket.attachments.push(...group.attachments);
    if (group.fallbackUsed) bucket.fallbackUsed = true;
    grouped.set(group.entityType, bucket);
  }

  const sections: QboAttachmentSection[] = [];
  for (const [entityType, bucket] of grouped.entries()) {
    const deduped = dedupeAttachments(bucket.attachments);
    if (deduped.length === 0) continue;
    const meta = getEntityTypeMeta(entityType);
    sections.push({
      entityType,
      label: meta.label,
      description: meta.description,
      icon: meta.icon,
      attachments: deduped,
      fallbackUsed: bucket.fallbackUsed,
    });
  }

  sections.sort(
    (a, b) =>
      compareEntityType(a.entityType, order, known) -
      compareEntityType(b.entityType, order, known),
  );

  return sections;
}

function buildSectionsFromFlat(attachments: QboAttachment[]): QboAttachmentSection[] {
  const grouped = new Map<string, QboAttachment[]>();
  for (const a of attachments) {
    const list = grouped.get(a.linkedEntityType) ?? [];
    list.push(a);
    grouped.set(a.linkedEntityType, list);
  }

  const order = getAllEntityTypeOrder();
  const known = new Set<string>(order);
  const sections: QboAttachmentSection[] = [];

  for (const [entityType, list] of grouped.entries()) {
    const meta = getEntityTypeMeta(entityType);
    sections.push({
      entityType,
      label: meta.label,
      description: meta.description,
      icon: meta.icon,
      attachments: list,
      fallbackUsed: false,
    });
  }

  sections.sort(
    (a, b) =>
      compareEntityType(a.entityType, order, known) -
      compareEntityType(b.entityType, order, known),
  );

  return sections;
}

export function useGroupedQboAttachments(
  data: QboProjectAttachments | undefined,
): QboAttachmentsGrouped {
  return useMemo<QboAttachmentsGrouped>(() => {
    if (!data) {
      return { sections: [], total: 0, isEmpty: true };
    }
    const sections =
      data.byEntity.length > 0
        ? buildSectionsFromByEntity(data.byEntity)
        : buildSectionsFromFlat(data.attachments);
    const total = sections.reduce((acc, s) => acc + s.attachments.length, 0);
    return { sections, total, isEmpty: total === 0 };
  }, [data]);
}
