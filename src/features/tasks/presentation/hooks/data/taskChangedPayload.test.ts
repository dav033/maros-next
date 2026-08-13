import { describe, expect, it } from "vitest";
import { parseTaskChangedPayload } from "./taskChangedPayload";

describe("parseTaskChangedPayload", () => {
  it("parses a well-formed payload", () => {
    expect(parseTaskChangedPayload('{"taskId":11,"actorId":2}')).toEqual({
      taskId: 11,
      actorId: 2,
    });
  });

  it("returns null for malformed JSON", () => {
    expect(parseTaskChangedPayload("not json")).toBeNull();
  });

  it("returns null when a required field is missing", () => {
    expect(parseTaskChangedPayload('{"taskId":11}')).toBeNull();
  });

  it("returns null when a field has the wrong type", () => {
    expect(parseTaskChangedPayload('{"taskId":"11","actorId":2}')).toBeNull();
  });

  it("returns null for a heartbeat's empty object", () => {
    expect(parseTaskChangedPayload("{}")).toBeNull();
  });
});
