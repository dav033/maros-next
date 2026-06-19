import { describe, expect, it } from "vitest";

import type { LeadDraft } from "../models";
import {
  ensureLeadDraftIntegrity,
  isLeadDraftIntegrityOK,
} from "./ensureLeadDraftIntegrity";

function newContactDraft(overrides: Partial<Record<string, unknown>> = {}): LeadDraft {
  return {
    leadNumber: "001-0626",
    name: "Lead de prueba",
    startDate: "2026-06-19",
    location: "Calle Falsa 123",
    status: null,
    projectTypeId: 1,
    contact: { name: "Ana", phone: "5550000", email: "" },
    ...overrides,
  } as unknown as LeadDraft;
}

describe("ensureLeadDraftIntegrity", () => {
  it("no lanza con un draft válido (contacto nuevo)", () => {
    expect(() => ensureLeadDraftIntegrity(newContactDraft())).not.toThrow();
  });

  it("lanza VALIDATION_ERROR si falta startDate", () => {
    try {
      ensureLeadDraftIntegrity(newContactDraft({ startDate: undefined }));
      throw new Error("debería haber lanzado");
    } catch (e) {
      expect((e as { kind: string }).kind).toBe("VALIDATION_ERROR");
    }
  });

  it("lanza FORMAT_ERROR si el nombre supera 140 caracteres", () => {
    try {
      ensureLeadDraftIntegrity(newContactDraft({ name: "x".repeat(141) }));
      throw new Error("debería haber lanzado");
    } catch (e) {
      expect((e as { kind: string }).kind).toBe("FORMAT_ERROR");
    }
  });

  it("lanza INTEGRITY_VIOLATION si contactId no es positivo", () => {
    const draft = {
      leadNumber: "001-0626",
      name: "X",
      startDate: "2026-06-19",
      location: "L",
      status: null,
      contactId: 0,
    } as unknown as LeadDraft;
    try {
      ensureLeadDraftIntegrity(draft);
      throw new Error("debería haber lanzado");
    } catch (e) {
      expect((e as { kind: string }).kind).toBe("INTEGRITY_VIOLATION");
    }
  });

  it("lanza VALIDATION_ERROR si no hay ni contacto ni contactId", () => {
    const draft = {
      leadNumber: "001-0626",
      name: "X",
      startDate: "2026-06-19",
      location: "L",
      status: null,
    } as unknown as LeadDraft;
    try {
      ensureLeadDraftIntegrity(draft);
      throw new Error("debería haber lanzado");
    } catch (e) {
      expect((e as { kind: string }).kind).toBe("VALIDATION_ERROR");
    }
  });
});

describe("isLeadDraftIntegrityOK", () => {
  it("true para draft válido, false para inválido", () => {
    expect(isLeadDraftIntegrityOK(newContactDraft())).toBe(true);
    expect(isLeadDraftIntegrityOK(newContactDraft({ startDate: "" }))).toBe(false);
  });
});
