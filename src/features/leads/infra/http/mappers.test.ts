import { describe, expect, it } from "vitest";

import type { LeadDraft } from "@/leads/domain";

import {
  type CreateLeadWithExistingContactPayload,
  type CreateLeadWithNewContactPayload,
  mapLeadDraftToCreatePayload,
} from "./mappers";

describe("mapLeadDraftToCreatePayload (contacto nuevo)", () => {
  const baseNewContact = {
    leadNumber: "001-0626",
    name: "001-0626-Calle",
    startDate: "2026-06-19",
    location: "Calle",
    addressLink: null,
    status: null,
    projectTypeId: 1,
    inReview: false,
    contact: { name: "Ana", phone: "5550000", email: "a@b.com" },
  } as unknown as LeadDraft;

  it("anida el contacto y arrastra los campos base del lead", () => {
    const payload = mapLeadDraftToCreatePayload(
      baseNewContact,
    ) as CreateLeadWithNewContactPayload;

    expect(payload.contact).toEqual({
      name: "Ana",
      phone: "5550000",
      email: "a@b.com",
    });
    expect(payload.location).toBe("Calle");
    expect(payload.startDate).toBe("2026-06-19");
    expect(payload.name).toBe("001-0626-Calle");
  });

  it("incluye companyId solo si es entero positivo", () => {
    const withCompany = mapLeadDraftToCreatePayload({
      ...(baseNewContact as object),
      contact: { name: "Ana", phone: "", email: "", companyId: 5 },
    } as unknown as LeadDraft) as CreateLeadWithNewContactPayload;
    expect(withCompany.contact.companyId).toBe(5);

    const withoutCompany = mapLeadDraftToCreatePayload({
      ...(baseNewContact as object),
      contact: { name: "Ana", phone: "", email: "", companyId: 0 },
    } as unknown as LeadDraft) as CreateLeadWithNewContactPayload;
    expect(withoutCompany.contact.companyId).toBeUndefined();
  });

  it("omite name cuando está vacío", () => {
    const payload = mapLeadDraftToCreatePayload({
      ...(baseNewContact as object),
      name: "   ",
    } as unknown as LeadDraft) as CreateLeadWithNewContactPayload;
    expect(payload.name).toBeUndefined();
  });
});

describe("mapLeadDraftToCreatePayload (contacto existente)", () => {
  it("incluye contactId y no incluye contact", () => {
    const draft = {
      leadNumber: "001-0626",
      name: "X",
      startDate: "2026-06-19",
      location: "Calle",
      addressLink: null,
      status: null,
      projectTypeId: 1,
      contactId: 42,
    } as unknown as LeadDraft;

    const payload = mapLeadDraftToCreatePayload(
      draft,
    ) as CreateLeadWithExistingContactPayload;

    expect(payload.contactId).toBe(42);
    expect(payload).not.toHaveProperty("contact");
  });
});
