import { describe, expect, it } from "vitest";

import type { Clock } from "@/shared/domain";

import {
  buildLeadDraftForExistingContact,
  buildLeadDraftForNewContact,
} from "./buildLeadDraft";

const clock: Clock = {
  now: () => 0,
  todayISO: () => "2026-06-19",
};

describe("buildLeadDraftForNewContact", () => {
  it("construye un draft válido con la fecha del clock y el contacto normalizado", () => {
    const draft = buildLeadDraftForNewContact(clock, {
      location: "  Calle 1 ",
      contact: { name: "  Ana  ", phone: " 5550000 ", email: "" },
    });

    expect(draft.startDate).toBe("2026-06-19");
    expect(draft.leadNumber).toBeNull();
    expect(draft.location).toBe("Calle 1");
    expect(draft.contact).toEqual({ name: "Ana", phone: "5550000", email: "" });
  });

  it("propaga el leadNumber provisto", () => {
    const draft = buildLeadDraftForNewContact(clock, {
      leadNumber: "001-0626",
      location: "L",
      contact: { name: "Ana", phone: "5550000", email: "" },
    });
    expect(draft.leadNumber).toBe("001-0626");
  });

  it("lanza si el nombre del lead supera el máximo", () => {
    expect(() =>
      buildLeadDraftForNewContact(clock, {
        leadName: "x".repeat(141),
        location: "L",
        contact: { name: "Ana", phone: "5550000", email: "" },
      }),
    ).toThrowError();
  });

  it("incluye inReview cuando se pasa", () => {
    const draft = buildLeadDraftForNewContact(
      clock,
      { location: "L", contact: { name: "Ana", phone: "5550000", email: "" } },
      {},
      true,
    );
    expect(draft.inReview).toBe(true);
  });
});

describe("buildLeadDraftForExistingContact", () => {
  it("construye un draft con contactId", () => {
    const draft = buildLeadDraftForExistingContact(clock, {
      location: "L",
      contactId: 42,
    });
    expect(draft.contactId).toBe(42);
    expect(draft.startDate).toBe("2026-06-19");
  });
});
