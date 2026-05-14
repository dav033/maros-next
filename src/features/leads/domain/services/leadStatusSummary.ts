import type { Lead, LeadStatus, LeadType, LeadStatusCount } from "../models";
import { filterLeadsByType } from "../utils/lead-type.utils";

export type StatusCounts = Readonly<Record<LeadStatus, number>>;
type MutableStatusCounts = Record<LeadStatus, number>;

function toEffectiveStatus(s: LeadStatus | null | undefined): LeadStatus {
  return (s ?? "NEW_LEAD") as LeadStatus;
}

function zeroCounts(): MutableStatusCounts {
  return {
    NEW_LEAD: 0,
    CONTACTED: 0,
    ESTIMATING_PREPARING_PROPOSAL: 0,
    PROPOSAL_SENT: 0,
    FOLLOW_UP: 0,
    WON: 0,
    LOST: 0,
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
    counts.NEW_LEAD +
    counts.CONTACTED +
    counts.ESTIMATING_PREPARING_PROPOSAL +
    counts.PROPOSAL_SENT +
    counts.FOLLOW_UP +
    counts.WON +
    counts.LOST;

  return { totalLeads, byStatus: counts as LeadStatusCount };
}

export function summarizeLeadsByType(
  leads: readonly Lead[],
  type: LeadType
): Readonly<{ totalLeads: number; byStatus: LeadStatusCount }> {
  const filtered = filterLeadsByType([...(leads ?? [])], type);
  return summarizeLeads(filtered);
}

export function countsInOrder(
  counts: StatusCounts,
  order: readonly LeadStatus[]
): ReadonlyArray<{ key: LeadStatus; count: number }> {
  return order.map((k) => ({ key: k, count: counts[k] ?? 0 }));
}
