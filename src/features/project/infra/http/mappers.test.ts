import { describe, expect, it } from "vitest";

import { mapProjectFromApi } from "./mappers";

const baseProject = {
  id: 42,
  notes: [],
  leadId: 7,
  lead: {
    id: 7,
    name: "Kitchen renovation",
    leadNumber: "PR-007",
    notes: [],
  },
};

describe("mapProjectFromApi", () => {
  it("preserves the canonical company client used by the projects table", () => {
    const project = mapProjectFromApi({
      ...baseProject,
      client: {
        id: 12,
        type: "company",
        name: "Acme Construction",
        isClient: true,
        isCustomer: false,
      },
    });

    expect(project.client).toEqual({
      id: 12,
      type: "company",
      name: "Acme Construction",
      isClient: true,
      isCustomer: false,
    });
  });

  it("returns null for an invalid client payload", () => {
    const project = mapProjectFromApi({
      ...baseProject,
      client: { id: "12" } as unknown as { id: number },
    });

    expect(project.client).toBeNull();
  });
});
