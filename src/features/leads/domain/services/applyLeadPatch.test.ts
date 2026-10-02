import { describe, expect, it } from "vitest";

import type { Clock, ISODate } from "@/shared/domain";

import { LeadStatus, type Lead } from "../models";
import { applyLeadPatch } from "./applyLeadPatch";
import { diffToPatch } from "./diffToPatch";

const clock: Clock = {
  now: () => Date.parse("2026-09-30T12:00:00Z"),
  todayISO: () => "2026-09-30" as ISODate,
};

function lead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 1,
    leadNumber: "050P-0826",
    name: "Lyon Plumbing",
    startDate: "2026-09-01",
    status: LeadStatus.NEW_LEAD,
    contact: { id: 2, name: "Ana", phone: "", email: "" },
    projectType: { id: 3, name: "Plumbing" },
    notes: [],
    attachments: [],
    inReview: false,
    estimate: null,
    qboEstimate: null,
    ownerId: null,
    source: null,
    lostReason: null,
    nextFollowUpAt: null,
    statusChangedAt: null,
    ...overrides,
  } as Lead;
}

describe("applyLeadPatch name", () => {
  it("renames a lead that already exists", () => {
    const { lead: updated } = applyLeadPatch(clock, lead(), { name: "Lyon Plumbing LLC" });
    expect(updated.name).toBe("Lyon Plumbing LLC");
  });

  it("keeps the current name when the patch clears it", () => {
    // `useInlineEdit` manda null cuando el campo queda vacío: sin esto se
    // guardaba el texto "null" como nombre del lead.
    const { lead: updated } = applyLeadPatch(clock, lead(), {
      name: null as unknown as string,
    });
    expect(updated.name).toBe("Lyon Plumbing");
  });

  it("keeps the current name when the patch is only whitespace", () => {
    const { lead: updated } = applyLeadPatch(clock, lead(), { name: "   " });
    expect(updated.name).toBe("Lyon Plumbing");
  });

  it("refuses a name longer than 140 characters", () => {
    expect(() => applyLeadPatch(clock, lead(), { name: "x".repeat(141) })).toThrow();
  });
});

describe("applyLeadPatch sales fields", () => {
  it("carries the lost reason together with the move to LOST", () => {
    const current = lead({ status: LeadStatus.PROPOSAL_SENT });
    const { lead: updated } = applyLeadPatch(clock, current, {
      status: LeadStatus.LOST,
      lostReason: "price",
    });
    expect(diffToPatch(current, updated)).toMatchObject({
      status: LeadStatus.LOST,
      lostReason: "price",
    });
  });

  it("keeps the null that clears the owner instead of dropping the field", () => {
    // Omitir el campo deja el valor anterior puesto en el backend: desasignar
    // sólo funciona si el null sobrevive al round trip del patch.
    const current = lead({ ownerId: 7, nextFollowUpAt: "2026-10-15" });
    const { lead: updated } = applyLeadPatch(clock, current, {
      ownerId: null,
      nextFollowUpAt: null,
    });
    const patch = diffToPatch(current, updated);
    expect(patch.ownerId).toBeNull();
    expect(patch.nextFollowUpAt).toBeNull();
  });

  it("leaves untouched sales fields out of the patch", () => {
    const current = lead({ ownerId: 7, source: "referral" });
    const { lead: updated } = applyLeadPatch(clock, current, { source: "google" });
    const patch = diffToPatch(current, updated);
    expect(patch).toEqual({ source: "google" });
  });

  it("refuses a follow-up date that is not YYYY-MM-DD", () => {
    expect(() =>
      applyLeadPatch(clock, lead(), { nextFollowUpAt: "15/10/2026" })
    ).toThrow();
  });
});
