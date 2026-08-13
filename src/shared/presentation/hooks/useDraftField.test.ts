import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDraftField } from "./useDraftField";

describe("useDraftField", () => {
  it("does not clobber an in-progress edit when the source refetches with a new value", () => {
    const { result, rerender } = renderHook(
      ({ recordId, sourceValue }: { recordId: number; sourceValue: string }) =>
        useDraftField(recordId, sourceValue),
      { initialProps: { recordId: 1, sourceValue: "Original title" } }
    );

    expect(result.current.value).toBe("Original title");

    // User starts typing — not yet saved.
    act(() => result.current.setValue("Original title, edited"));
    expect(result.current.value).toBe("Original title, edited");

    // A sibling field's mutation invalidates the whole record and it refetches —
    // same record id, but the source value now has a new object identity from the
    // server. This must NOT stomp the unsaved edit.
    rerender({ recordId: 1, sourceValue: "Original title" });
    expect(result.current.value).toBe("Original title, edited");
  });

  it("resets to the fresh source value on a refetch once the edit has been committed", () => {
    const { result, rerender } = renderHook(
      ({ recordId, sourceValue }: { recordId: number; sourceValue: string }) =>
        useDraftField(recordId, sourceValue),
      { initialProps: { recordId: 1, sourceValue: "Original title" } }
    );

    act(() => result.current.setValue("Saved title"));
    act(() => result.current.commit());

    rerender({ recordId: 1, sourceValue: "Saved title" });
    expect(result.current.value).toBe("Saved title");
  });

  it("resets even while dirty when the record id changes", () => {
    const { result, rerender } = renderHook(
      ({ recordId, sourceValue }: { recordId: number; sourceValue: string }) =>
        useDraftField(recordId, sourceValue),
      { initialProps: { recordId: 1, sourceValue: "Task one" } }
    );

    act(() => result.current.setValue("Unsaved edit on task one"));
    expect(result.current.value).toBe("Unsaved edit on task one");

    // Switching to a different record must always win, even mid-edit — the draft
    // belongs to the record that's no longer open.
    rerender({ recordId: 2, sourceValue: "Task two" });
    expect(result.current.value).toBe("Task two");
  });

  it("picks up a refetched value that has genuinely changed while not dirty", () => {
    const { result, rerender } = renderHook(
      ({ recordId, sourceValue }: { recordId: number; sourceValue: string }) =>
        useDraftField(recordId, sourceValue),
      { initialProps: { recordId: 1, sourceValue: "Original title" } }
    );

    // Nothing typed yet — a refetch that legitimately changed the value (e.g.
    // someone else edited it) should still be reflected.
    rerender({ recordId: 1, sourceValue: "Renamed by someone else" });
    expect(result.current.value).toBe("Renamed by someone else");
  });
});
