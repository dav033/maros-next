import { describe, expect, it } from "vitest";
import { noteSubtreeIds } from "./noteSubtreeIds";
import type { NotePageSummary } from "../models";

function page(id: number, parentId: number | null): NotePageSummary {
  return {
    id, parentId, kind: "page", title: "", icon: null, position: 0, isFavorite: false,
    visibility: "team", isShared: false, isPublished: false, entityKind: null, entityId: null,
    ownerId: null, deletedAt: null, createdAt: "", updatedAt: "", lastEditedBy: null, tags: [],
  };
}

describe("noteSubtreeIds", () => {
  it("includes a folder and all of its descendants, but not siblings", () => {
    const ids = noteSubtreeIds([page(1, null), page(2, 1), page(3, 2), page(4, 1), page(5, null)], 1);
    expect([...ids].sort()).toEqual([1, 2, 3, 4]);
  });
});
