import { describe, expect, it } from "vitest";
import { AppError } from "@/shared/errors";
import { isTaskConflictError } from "./taskConflict";

describe("isTaskConflictError", () => {
  it("recognizes the backend's TASK_CONFLICT code", () => {
    const error = new AppError({
      userMessage: "Alguien más editó esta tarea mientras tanto.",
      kind: "conflict",
      status: 409,
      code: "TASK_CONFLICT",
    });
    expect(isTaskConflictError(error)).toBe(true);
  });

  it("is false for an unrelated 409 (e.g. a label name conflict)", () => {
    const error = new AppError({
      userMessage: "A label with this name already exists",
      kind: "conflict",
      status: 409,
      code: "TASK_LABEL_NAME_CONFLICT",
    });
    expect(isTaskConflictError(error)).toBe(false);
  });

  it("is false for a plain network error", () => {
    expect(isTaskConflictError(new Error("Network request failed"))).toBe(false);
  });
});
