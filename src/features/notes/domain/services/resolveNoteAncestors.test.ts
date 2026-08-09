import { describe, expect, it } from "vitest";
import { resolveNoteAncestors } from "./resolveNoteAncestors";
import type { NotePageSummary } from "../models";

function page(overrides: Partial<NotePageSummary> & { id: number }): NotePageSummary {
  return {
    parentId: null,
    title: `Page ${overrides.id}`,
    icon: null,
    position: 0,
    isFavorite: false,
    entityKind: null,
    entityId: null,
    deletedAt: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    tags: [],
    ...overrides,
  };
}

describe("resolveNoteAncestors", () => {
  it("returns an empty chain for a root page", () => {
    const pages = [page({ id: 1 })];
    expect(resolveNoteAncestors(pages, 1)).toEqual([]);
  });

  it("returns ancestors root-first, excluding the page itself", () => {
    const pages = [
      page({ id: 1, title: "Riverside Remodel" }),
      page({ id: 2, title: "Site Visit", parentId: 1 }),
      page({ id: 3, title: "Framing Notes", parentId: 2 }),
    ];
    expect(resolveNoteAncestors(pages, 3).map((p) => p.id)).toEqual([1, 2]);
  });

  it("stops early when an ancestor is missing from the list (e.g. trashed separately)", () => {
    const pages = [
      // id 1 (would-be root) intentionally absent
      page({ id: 2, title: "Site Visit", parentId: 1 }),
      page({ id: 3, title: "Framing Notes", parentId: 2 }),
    ];
    expect(resolveNoteAncestors(pages, 3).map((p) => p.id)).toEqual([2]);
  });

  it("returns an empty chain when the page itself isn't in the list", () => {
    const pages = [page({ id: 1 })];
    expect(resolveNoteAncestors(pages, 999)).toEqual([]);
  });
});
