import { describe, expect, it } from "vitest";
import { textToTipTapDoc, tiptapDocToText } from "./tiptapPlainText";

describe("textToTipTapDoc / tiptapDocToText", () => {
  it("round-trips multi-line text through a TipTap doc", () => {
    const text = "First line\nSecond line\n\nFourth line";
    const doc = textToTipTapDoc(text);
    expect(tiptapDocToText(doc)).toBe(text);
  });

  it("produces an empty doc for empty text", () => {
    expect(tiptapDocToText(textToTipTapDoc(""))).toBe("");
  });

  it("returns empty string for a null/undefined doc", () => {
    expect(tiptapDocToText(null)).toBe("");
    expect(tiptapDocToText(undefined)).toBe("");
  });
});
