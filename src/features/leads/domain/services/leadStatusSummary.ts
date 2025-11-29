import type { Lead, LeadStatus, LeadType, LeadStatusCount } from "../models";

export type StatusCounts = Readonly<Record<LeadStatus, number>>;
type MutableStatusCounts = Record<LeadStatus, number>;

function toEffectiveStatus(s: LeadStatus | null | undefined): LeadStatus {
  return (s ?? "NOT_EXECUTED") as LeadStatus;
}

function zeroCounts(): MutableStatusCounts {
  return {
    NOT_EXECUTED: 0,
    COMPLETED: 0,
    IN_PROGRESS: 0,
    LOST: 0,
    POSTPONED: 0,
    PERMITS: 0,
  } as MutableStatusCounts;
}

export function summarizeLeads(
  leads: readonly Lead[]
): Readonly<{ totalLeads: number; byStatus: LeadStatusCount }> {
  const counts = zeroCounts();
  const src = Array.isArray(leads) ? leads : [];

  for (const lead of src) {
    const s = toEffectiveStatus(lead.status);
    counts[s] = (counts[s] ?? 0) + 1;
  }

  const totalLeads =
    counts.NOT_EXECUTED +
    counts.COMPLETED +
    counts.IN_PROGRESS +
    counts.LOST +
    counts.POSTPONED +
    counts.PERMITS;

  return { totalLeads, byStatus: counts as LeadStatusCount };
}

export function summarizeLeadsByType(
  leads: readonly Lead[],
  type: LeadType
): Readonly<{ totalLeads: number; byStatus: LeadStatusCount }> {
  const filtered = (leads ?? []).filter((l) => l.leadType === type);
  return summarizeLeads(filtered);
}

export function countsInOrder(
  counts: StatusCounts,
  order: readonly LeadStatus[]
): ReadonlyArray<{ key: LeadStatus; count: number }> {
  return order.map((k) => ({ key: k, count: counts[k] ?? 0 }));
}
