import { describe, expect, it } from "vitest";

import type { NewContact } from "../models";
import {
  ensureExclusiveContactLink,
  normalizeNewContact,
  resolveContactLink,
} from "./leadContactLinkPolicy";

describe("normalizeNewContact", () => {
  // Regresión: solo deben sobrevivir name/phone/email/companyId. Si se colaran
  // campos extra (address, etc.), el backend los rechazaría por whitelist (400).
  it("normaliza y conserva únicamente name/phone/email/companyId", () => {
    const result = normalizeNewContact({
      name: "  Juan  Pérez ",
      phone: "  5550000 ",
      email: "  a@b.com ",
      companyId: 3,
      address: "no debe pasar",
    } as NewContact & { address: string });

    expect(result).toEqual({
      name: "Juan Pérez",
      phone: "5550000",
      email: "a@b.com",
      companyId: 3,
    });
    expect(result).not.toHaveProperty("address");
  });

  it("descarta companyId no positivo o no entero", () => {
    expect(normalizeNewContact({ name: "a", phone: "", email: "", companyId: 0 })).not.toHaveProperty("companyId");
    expect(normalizeNewContact({ name: "a", phone: "", email: "", companyId: -1 })).not.toHaveProperty("companyId");
    expect(normalizeNewContact({ name: "a", phone: "", email: "", companyId: 2.5 })).not.toHaveProperty("companyId");
  });
});

describe("ensureExclusiveContactLink", () => {
  const contact: NewContact = { name: "a", phone: "", email: "" };

  it("lanza INTEGRITY_VIOLATION si se proveen contacto e id a la vez", () => {
    expect(() =>
      ensureExclusiveContactLink({ contact, contactId: 5 }),
    ).toThrowError();
    try {
      ensureExclusiveContactLink({ contact, contactId: 5 });
    } catch (e) {
      expect((e as { kind: string }).kind).toBe("INTEGRITY_VIOLATION");
    }
  });

  it("lanza VALIDATION_ERROR si no se provee ninguno", () => {
    try {
      ensureExclusiveContactLink({});
      throw new Error("debería haber lanzado");
    } catch (e) {
      expect((e as { kind: string }).kind).toBe("VALIDATION_ERROR");
    }
  });

  it("no lanza con solo contacto o solo id", () => {
    expect(() => ensureExclusiveContactLink({ contact })).not.toThrow();
    expect(() => ensureExclusiveContactLink({ contactId: 5 })).not.toThrow();
  });
});

describe("resolveContactLink", () => {
  it("resuelve un contacto nuevo normalizado", () => {
    const link = resolveContactLink({
      contact: { name: " A ", phone: " 1 ", email: "" },
    });
    expect(link).toEqual({
      kind: "new",
      contact: { name: "A", phone: "1", email: "" },
    });
  });

  it("resuelve un contacto existente por id", () => {
    expect(resolveContactLink({ contactId: 7 })).toEqual({
      kind: "existing",
      contactId: 7,
    });
  });
});
