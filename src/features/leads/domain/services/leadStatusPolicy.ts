import type { Lead, LeadStatus } from "../models";
import type { Clock } from "@/shared";
import { BusinessRuleError } from "@/shared";

export type DomainEvent = Readonly<{
  type: string;
  payload: Record<string, unknown>;
}>;

export const DEFAULT_TRANSITIONS: Readonly<
  Partial<Record<LeadStatus, readonly LeadStatus[]>>
> = ({
  NOT_EXECUTED: ["IN_PROGRESS", "PERMITS", "POSTPONED"],
  COMPLETED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED", "LOST", "POSTPONED", "PERMITS"],
  LOST: ["IN_PROGRESS", "NOT_EXECUTED"],
  POSTPONED: ["IN_PROGRESS", "NOT_EXECUTED"],
  PERMITS: ["IN_PROGRESS", "POSTPONED"],
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
