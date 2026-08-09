import { describe, expect, it } from "vitest";
import { flattenVisibleTree } from "./flattenVisibleTree";
import type { NoteTreeNode } from "../models";

function node(overrides: Partial<NoteTreeNode> & { id: number }): NoteTreeNode {
  return {
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
    createdAt: "",
    updatedAt: "",
    lastEditedBy: null,
    tags: [],
    children: [],
    ...overrides,
  };
}

describe("flattenVisibleTree", () => {
  it("hides children of a collapsed node", () => {
    const tree = [node({ id: 1, children: [node({ id: 2, parentId: 1 })] })];
    const rows = flattenVisibleTree(tree, new Set());
    expect(rows.map((r) => r.id)).toEqual([1]);
  });

  it("shows children of an expanded node with incremented depth", () => {
    const tree = [node({ id: 1, children: [node({ id: 2, parentId: 1 })] })];
    const rows = flattenVisibleTree(tree, new Set(["1"]));
    expect(rows).toEqual([
      {
        id: 1,
        parentId: null,
        kind: "page",
        title: "Untitled",
        icon: null,
        isFavorite: false,
        isShared: false,
        isPublished: false,
        depth: 0,
        hasChildren: true,
      },
      {
        id: 2,
        parentId: 1,
        kind: "page",
        title: "Untitled",
        icon: null,
        isFavorite: false,
        isShared: false,
        isPublished: false,
        depth: 1,
        hasChildren: false,
      },
    ]);
  });

  it("recurses through multiple expanded levels", () => {
    const tree = [
      node({
        id: 1,
        children: [
          node({ id: 2, parentId: 1, children: [node({ id: 3, parentId: 2 })] }),
        ],
      }),
    ];
    const rows = flattenVisibleTree(tree, new Set(["1", "2"]));
    expect(rows.map((r) => [r.id, r.depth])).toEqual([
      [1, 0],
      [2, 1],
      [3, 2],
    ]);
  });
});
