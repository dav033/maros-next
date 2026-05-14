import type { Lead, LeadStatus } from "../models";
import type { Clock } from "@/shared/domain";
import { BusinessRuleError } from "@/shared/domain";

export type DomainEvent = Readonly<{
  type: string;
  payload: Record<string, unknown>;
}>;

const ALL_STATUSES: readonly LeadStatus[] = [
  "NEW_LEAD",
  "CONTACTED",
  "ESTIMATING_PREPARING_PROPOSAL",
  "PROPOSAL_SENT",
  "FOLLOW_UP",
  "WON",
  "LOST",
] as const as readonly LeadStatus[];

export const DEFAULT_TRANSITIONS: Readonly<
  Partial<Record<LeadStatus, readonly LeadStatus[]>>
> = ({
  NEW_LEAD: ALL_STATUSES.filter((s) => s !== "NEW_LEAD"),
  CONTACTED: ALL_STATUSES.filter((s) => s !== "CONTACTED"),
  ESTIMATING_PREPARING_PROPOSAL: ALL_STATUSES.filter((s) => s !== "ESTIMATING_PREPARING_PROPOSAL"),
  PROPOSAL_SENT: ALL_STATUSES.filter((s) => s !== "PROPOSAL_SENT"),
  FOLLOW_UP: ALL_STATUSES.filter((s) => s !== "FOLLOW_UP"),
  WON: ALL_STATUSES.filter((s) => s !== "WON"),
  LOST: ALL_STATUSES.filter((s) => s !== "LOST"),
} as unknown) as Readonly<Partial<Record<LeadStatus, readonly LeadStatus[]>>>;

export function canTransition(
  from: LeadStatus,
  to: LeadStatus,
  transitions: Readonly<Partial<Record<LeadStatus, readonly LeadStatus[]>>> = DEFAULT_TRANSITIONS
): boolean {
  return from === to || (transitions[from] ?? []).includes(to);
}

export function ensureTransition(
  from: LeadStatus,
  to: LeadStatus,
  transitions: Readonly<Partial<Record<LeadStatus, readonly LeadStatus[]>>> = DEFAULT_TRANSITIONS
): void {
  if (!canTransition(from, to, transitions)) {
    throw new BusinessRuleError(
      "INVALID_TRANSITION",
      `Cannot transition from ${String(from)} to ${String(to)}`,
      { details: { from, to } }
    );
  }
}

export function applyStatus(
  clock: Clock,
  lead: Lead,
  to: LeadStatus,
  transitions: Readonly<Partial<Record<LeadStatus, readonly LeadStatus[]>>> = DEFAULT_TRANSITIONS
): { lead: Lead; events: DomainEvent[] } {
  const from: LeadStatus = lead.status;
  if (to === from) return { lead, events: [] };

  ensureTransition(from, to, transitions);

  const updated: Lead = { ...lead, status: to };
  const events: DomainEvent[] = [{
    type: "LeadStatusChanged",
    payload: { id: lead.id, from, to, at: clock.now() },
  }];

  return { lead: updated, events };
}
