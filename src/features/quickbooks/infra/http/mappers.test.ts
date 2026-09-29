import { describe, expect, it } from "vitest";

import { mapProjectLinkAssignment, mapProjectLinkRemoval } from "./mappers";

describe("mapProjectLinkAssignment", () => {
  it("keeps the previous job when the link was replaced", () => {
    const result = mapProjectLinkAssignment({
      projectId: 42,
      leadId: 7,
      projectNumber: "097-0726",
      qboCustomerId: "318",
      jobDisplayName: "097-0726, 12 NW 2nd St",
      previousQboCustomerId: "201",
      linked: true,
      alreadyLinked: false,
      projectNumberMatchesJob: true,
    });

    expect(result).toEqual({
      projectId: 42,
      leadId: 7,
      projectNumber: "097-0726",
      qboCustomerId: "318",
      jobDisplayName: "097-0726, 12 NW 2nd St",
      previousQboCustomerId: "201",
      linked: true,
      alreadyLinked: false,
      projectNumberMatchesJob: true,
    });
  });

  it("normalises the nullable fields of a first link", () => {
    const result = mapProjectLinkAssignment({
      projectId: 42,
      leadId: null,
      projectNumber: null,
      qboCustomerId: "318",
      jobDisplayName: null as unknown as string,
      previousQboCustomerId: null,
      linked: true,
      alreadyLinked: false,
      // Un backend viejo no manda el campo: no puede volverse `true` por omisión.
      projectNumberMatchesJob: undefined as unknown as boolean,
    });

    expect(result).toMatchObject({
      leadId: null,
      projectNumber: null,
      jobDisplayName: "",
      previousQboCustomerId: null,
      projectNumberMatchesJob: false,
    });
  });
});

describe("mapProjectLinkRemoval", () => {
  it("reports a no-op unlink without inventing a previous job", () => {
    expect(
      mapProjectLinkRemoval({
        projectId: 42,
        leadId: null,
        previousQboCustomerId: null,
        unlinked: false,
      }),
    ).toEqual({
      projectId: 42,
      leadId: null,
      previousQboCustomerId: null,
      unlinked: false,
    });
  });
});
