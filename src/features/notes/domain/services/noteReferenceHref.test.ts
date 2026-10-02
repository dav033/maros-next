import { describe, expect, it } from "vitest";
import { NOTE_REFERENCE_KINDS, noteReferenceHref } from "../models";

describe("noteReferenceHref", () => {
  it("points each kind at its own detail route", () => {
    expect(noteReferenceHref("lead", 42)).toBe("/lead/42");
    expect(noteReferenceHref("project", 7)).toBe("/project/7");
    expect(noteReferenceHref("contact", 3)).toBe("/contact/3");
    expect(noteReferenceHref("company", 8)).toBe("/company/8");
    expect(noteReferenceHref("task", 9)).toBe("/tasks/9");
    expect(noteReferenceHref("note", 1)).toBe("/notes/1");
  });

  /**
   * A colleague has no profile page in this app. The chip has to render as a label rather
   * than be pointed at /settings/users, which most members cannot open — a link that 403s
   * is worse than no link.
   */
  it("gives a colleague no link, because there is no page to open", () => {
    expect(noteReferenceHref("user", 5)).toBeNull();
  });

  /**
   * The guard that matters: adding a kind to NOTE_REFERENCE_KINDS without teaching this
   * function about it would otherwise return undefined, and every chip of the new kind
   * would silently render as unclickable text.
   */
  it("answers for every declared kind", () => {
    for (const kind of NOTE_REFERENCE_KINDS) {
      expect(noteReferenceHref(kind, 1)).not.toBeUndefined();
    }
  });
});
