import { describe, expect, it } from "vitest";
import { classifyAttachmentsChange } from "./taskAttachmentsDiff";

describe("classifyAttachmentsChange", () => {
  it("classifies an upload as add, with only the new keys", () => {
    const result = classifyAttachmentsChange(["a.png"], ["a.png", "b.png", "c.png"]);
    expect(result).toEqual({ op: "add", keys: ["b.png", "c.png"] });
  });

  it("classifies a single removal as remove", () => {
    const result = classifyAttachmentsChange(["a.png", "b.png"], ["a.png"]);
    expect(result).toEqual({ op: "remove", key: "b.png" });
  });

  it("classifies a same-membership reorder as reorder", () => {
    const result = classifyAttachmentsChange(["a.png", "b.png", "c.png"], ["c.png", "a.png", "b.png"]);
    expect(result).toEqual({ op: "reorder", keys: ["c.png", "a.png", "b.png"] });
  });

  it("classifies an identical list as noop", () => {
    const result = classifyAttachmentsChange(["a.png", "b.png"], ["a.png", "b.png"]);
    expect(result).toEqual({ op: "noop" });
  });

  it("falls back to reorder for shapes EntityAttachmentsSection never produces, without losing data", () => {
    // Two removals at once — not a real call site today, but the fallback must stay
    // additive-safe rather than guessing which key mattered more.
    const result = classifyAttachmentsChange(["a.png", "b.png", "c.png"], ["a.png"]);
    expect(result).toEqual({ op: "reorder", keys: ["a.png"] });
  });
});
