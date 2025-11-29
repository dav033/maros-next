import type { Lead, LeadStatus, LeadType } from "../models";

function effectiveStatus(s: LeadStatus | null | undefined): LeadStatus {
  return (s ?? "NOT_EXECUTED") as LeadStatus;
}

const STATUS_ORDER = [
  "NOT_EXECUTED",
  "IN_PROGRESS",
  "PERMITS",
  "POSTPONED",
  "COMPLETED",
  "LOST",
] as const;

export const DEFAULT_STATUS_ORDER: readonly LeadStatus[] =
  STATUS_ORDER as unknown as readonly LeadStatus[];

export function filterByType(leads: readonly Lead[], type: LeadType): Lead[] {
  return (leads ?? []).filter((l) => l.leadType === type);
}

export function filterByStatus(
  leads: readonly Lead[],
  status: LeadStatus
): Lead[] {
  return (leads ?? []).filter((l) => effectiveStatus(l.status) === status);
}

export function partitionByStatus(
  leads: readonly Lead[]
): Partial<Record<LeadStatus, Lead[]>> {
  const buckets: Partial<Record<LeadStatus, Lead[]>> = {};
  for (const s of DEFAULT_STATUS_ORDER) buckets[s] = [];
  for (const l of leads ?? []) {
    const key = effectiveStatus(l.status);
    (buckets[key] ||= []).push(l);
  }
  return buckets;
}

export function sortByStartDateDesc(leads: readonly Lead[]): Lead[] {
  return [...(leads ?? [])].sort((a, b) =>
    a.startDate > b.startDate ? -1 : a.startDate < b.startDate ? 1 : 0
  );
}
