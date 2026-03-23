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
import { normalizeText, isIsoLocalDate, coerceIsoLocalDate } from "@/shared/validation";

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

function toEffectiveStatus(
  s: LeadStatus | null | undefined | string,
  current: LeadStatus
): LeadStatus {
  // undefined => no cambio de estado
  if (s === undefined) return current;

  // null => volver al estado por defecto
  if (s === null) return "NOT_EXECUTED" as LeadStatus;

  // Strings vacíos (por ejemplo, selects HTML sin valor) => no cambio
  const normalized = String(s).trim();
  if (!normalized) return current;

  return normalized as LeadStatus;
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

  addressLink: (v, _ctx, acc) => {
   
    if (v === null) {
      return { ...acc, addressLink: undefined };
    }
    const val = normalizeText(String(v));
    return { ...acc, addressLink: val || undefined };
  },

  leadNumber: (v, ctx, acc) => {
    const rules = ctx.policies.leadNumberPattern
      ? { pattern: ctx.policies.leadNumberPattern }
      : undefined;
    const normalized = makeLeadNumber(v as string | null | undefined, rules);
    return { ...acc, leadNumber: normalized ?? "" };
  },

  startDate: (v, _ctx, acc) => {
    // Manejar null, undefined, o valores vacíos
    if (v === null || v === undefined || v === "") {
      return { ...acc, startDate: null };
    }
    
    // Si el valor es un string, normalizarlo
    const strValue = String(v);
    const d = normalizeText(strValue);
    
    // Si después de normalizar está vacío, establecer a null
    if (!d) {
      return { ...acc, startDate: null };
    }
    
    // Validar formato YYYY-MM-DD
    if (!isIsoLocalDate(d)) {
      // Intentar normalizar usando coerceIsoLocalDate como fallback
      try {
        const coerced = coerceIsoLocalDate(d);
        if (isIsoLocalDate(coerced)) {
          return { ...acc, startDate: coerced as ISODate };
        }
      } catch {
        // Si falla la coerción, lanzar error
      }
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
    const to = toEffectiveStatus(
      s as LeadStatus | null | undefined | string,
      acc.status
    );
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
    notes: Array.isArray(v) ? v : [],
  }),

  inReview: (v, _ctx, acc) => ({
    ...acc,
    inReview: Boolean(v),
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
