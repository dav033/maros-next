import { describe, expect, it } from "vitest";
import { noteDocToText, textToNoteDoc } from "./plainTextDoc";

describe("textToNoteDoc / noteDocToText", () => {
  it("round-trips multi-line text through a TipTap doc", () => {
    const text = "First line\nSecond line\n\nFourth line";
    const doc = textToNoteDoc(text);
    expect(noteDocToText(doc)).toBe(text);
  });

  it("produces an empty doc for empty text", () => {
    expect(noteDocToText(textToNoteDoc(""))).toBe("");
  });

  it("returns empty string for a null/undefined doc", () => {
    expect(noteDocToText(null)).toBe("");
    expect(noteDocToText(undefined)).toBe("");
  });
});
