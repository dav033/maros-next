import type {
  ApplyLeadPatchResult,
  Lead,
  LeadPatch,
  LeadPolicies,
  LeadStatus,
} from "../models";
import type { Clock, ISODate } from "@/shared/domain";
import { BusinessRuleError } from "@/shared/domain";

import { ensureLeadIntegrity } from "./ensureLeadIntegrity";
import { makeLeadNumber } from "./leadNumberPolicy";
import { applyStatus, DEFAULT_TRANSITIONS } from "./leadStatusPolicy";

function normalizeText(s: string): string {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function isIsoLocalDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function validateLeadName(raw: string): string {
  const v = normalizeText(raw);
  if (!v) {
    throw new BusinessRuleError(
      "VALIDATION_ERROR",
      "Lead name must not be empty",
      { details: { field: "name" } }
    );
  }
  if (v.length > 140) {
    throw new BusinessRuleError("FORMAT_ERROR", "Lead name max length is 140", {
      details: { field: "name", length: v.length },
    });
  }
  return v;
}

function toEffectiveStatus(s: LeadStatus | null | undefined): LeadStatus {
  return (s ?? "NOT_EXECUTED") as LeadStatus;
}

function resolveTransitions(
  overrides?: Partial<Record<LeadStatus, LeadStatus[]>>
): Readonly<Partial<Record<LeadStatus, readonly LeadStatus[]>>> {
  const ro = (arr?: LeadStatus[]) =>
    (arr as readonly LeadStatus[]) || undefined;
  return {
    NOT_EXECUTED:
      ro(overrides?.NOT_EXECUTED) ?? DEFAULT_TRANSITIONS.NOT_EXECUTED,
    COMPLETED: ro(overrides?.COMPLETED) ?? DEFAULT_TRANSITIONS.COMPLETED,
    IN_PROGRESS: ro(overrides?.IN_PROGRESS) ?? DEFAULT_TRANSITIONS.IN_PROGRESS,
    LOST: ro(overrides?.LOST) ?? DEFAULT_TRANSITIONS.LOST,
    POSTPONED: ro(overrides?.POSTPONED) ?? DEFAULT_TRANSITIONS.POSTPONED,
    PERMITS: ro(overrides?.PERMITS) ?? DEFAULT_TRANSITIONS.PERMITS,
  } as const;
}

type PatchHandlerCtx = Readonly<{
  clock: Clock;
  current: Lead;
  policies: LeadPolicies;
  events: ApplyLeadPatchResult["events"];
}>;

const PATCH_HANDLERS: {
  [K in keyof LeadPatch]?: (
    value: LeadPatch[K],
    ctx: PatchHandlerCtx,
    acc: Lead
  ) => Lead;
} = {
  name: (v, _ctx, acc) => ({ ...acc, name: validateLeadName(String(v)) }),

  location: (v, _ctx, acc) => {
    const val = normalizeText(String(v));
    return { ...acc, location: val || undefined };
  },

  leadNumber: (v, ctx, acc) => {
    const rules = ctx.policies.leadNumberPattern
      ? { pattern: ctx.policies.leadNumberPattern }
      : undefined;
    const normalized = makeLeadNumber(v as string | null | undefined, rules);
    return { ...acc, leadNumber: normalized ?? "" };
  },

  startDate: (v, _ctx, acc) => {
    const d = normalizeText(String(v));
    if (d && !isIsoLocalDate(d)) {
      throw new BusinessRuleError(
        "FORMAT_ERROR",
        "startDate must be in YYYY-MM-DD format",
        { details: { field: "startDate", value: v } }
      );
    }
    return { ...acc, startDate: d as ISODate };
  },

  projectTypeId: (id, _ctx, acc) => ({
    ...acc,
    projectType: { ...acc.projectType, id: Number(id) },
  }),

  contactId: (id, _ctx, acc) => ({
    ...acc,
    contact: { ...acc.contact, id: Number(id) },
  }),

  status: (s, ctx, acc) => {
    const to = toEffectiveStatus(s as LeadStatus | null | undefined);
    const transitions = resolveTransitions(ctx.policies.allowedTransitions);
    const { lead: withStatus, events } = applyStatus(
      ctx.clock,
      acc,
      to,
      transitions
    );
    if (events.length) ctx.events.push(...events);
    return withStatus;
  },
  notes: (v, _ctx, acc) => ({
    ...acc,
    notesJson: Array.isArray(v) ? JSON.stringify(v) : undefined,
  }),
};

export function applyLeadPatch(
  clock: Clock,
  current: Lead,
  patch: LeadPatch,
  policies: LeadPolicies = {}
): ApplyLeadPatchResult {
  let updated: Lead = { ...current };
  const events: ApplyLeadPatchResult["events"] = [];

  const ctx: PatchHandlerCtx = { clock, current, policies, events };

  (Object.keys(patch) as (keyof LeadPatch)[])
    .filter((k) => (patch as Record<string, unknown>)[k] !== undefined)
    .forEach((k) => {
      const handler = PATCH_HANDLERS[k];
      if (handler) {
        updated = handler((patch as any)[k], ctx, updated);
      }
    });

  const integrityPolicies = policies.leadNumberPattern
    ? { leadNumberRules: { pattern: policies.leadNumberPattern } }
    : undefined;
  ensureLeadIntegrity(updated, integrityPolicies);

  return { lead: updated, events };
}
