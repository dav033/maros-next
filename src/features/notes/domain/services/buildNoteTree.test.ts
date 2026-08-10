import { describe, expect, it } from "vitest";
import { buildNoteTree } from "./buildNoteTree";
import type { NotePageSummary } from "../models";

function page(overrides: Partial<NotePageSummary>): NotePageSummary {
  return {
    id: 1,
    parentId: null,
    kind: "page",
    title: "Untitled",
    icon: null,
    position: 0,
    isFavorite: false,
    visibility: "team",
    isShared: false,
    isPublished: false,
    entityKind: null,
    entityId: null,
    ownerId: null,
    deletedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    lastEditedBy: null,
    tags: [],
    ...overrides,
  };
}

describe("buildNoteTree", () => {
  it("nests children under their parent, sorted by position", () => {
    const pages = [
      page({ id: 1, position: 1000 }),
      page({ id: 2, parentId: 1, position: 2000 }),
      page({ id: 3, parentId: 1, position: 1000 }),
    ];

    const tree = buildNoteTree(pages);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe(1);
    expect(tree[0].children.map((c) => c.id)).toEqual([3, 2]);
  });

  it("sorts root pages by position", () => {
    const pages = [
      page({ id: 1, position: 2000 }),
      page({ id: 2, position: 1000 }),
    ];
    const tree = buildNoteTree(pages);
    expect(tree.map((n) => n.id)).toEqual([2, 1]);
  });

  it("puts starred siblings first and preserves position within each group", () => {
    const pages = [
      page({ id: 1, position: 1000 }),
      page({ id: 2, position: 3000, isFavorite: true }),
      page({ id: 3, position: 2000, isFavorite: true }),
      page({ id: 4, position: 500 }),
    ];

    const tree = buildNoteTree(pages);

    expect(tree.map((n) => n.id)).toEqual([3, 2, 4, 1]);
  });

  it("surfaces a page as a root when its parentId does not resolve", () => {
    const pages = [page({ id: 1, parentId: 999 })];
    const tree = buildNoteTree(pages);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe(1);
  });

  it("nests grandchildren correctly", () => {
    const pages = [
      page({ id: 1 }),
      page({ id: 2, parentId: 1 }),
      page({ id: 3, parentId: 2 }),
    ];
    const tree = buildNoteTree(pages);
    expect(tree[0].children[0].children[0].id).toBe(3);
  });
});
