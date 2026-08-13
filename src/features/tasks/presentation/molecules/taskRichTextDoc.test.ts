import { describe, expect, it } from "vitest";
import { isBlankDoc, isEmptyDoc } from "./taskRichTextDoc";

describe("isEmptyDoc", () => {
  it("is true for null/undefined", () => {
    expect(isEmptyDoc(null)).toBe(true);
    expect(isEmptyDoc(undefined)).toBe(true);
  });

  it("is true for the backend's default {} on a brand-new task", () => {
    expect(isEmptyDoc({})).toBe(true);
  });

  it("is false for a doc with content, even a single empty paragraph", () => {
    expect(isEmptyDoc({ type: "doc", content: [{ type: "paragraph" }] })).toBe(false);
  });
});

describe("isBlankDoc", () => {
  it("is true for an empty doc", () => {
    expect(isBlankDoc({})).toBe(true);
  });

  it("is true for a doc that's just an empty paragraph — nothing typed", () => {
    expect(isBlankDoc({ type: "doc", content: [{ type: "paragraph" }] })).toBe(true);
  });

  it("is false once a paragraph carries text", () => {
    expect(
      isBlankDoc({
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "hi" }] }],
      })
    ).toBe(false);
  });

  it("is false when any block among several carries content", () => {
    expect(
      isBlankDoc({
        type: "doc",
        content: [
          { type: "paragraph" },
          { type: "paragraph", content: [{ type: "text", text: "hi" }] },
        ],
      })
    ).toBe(false);
  });
});
