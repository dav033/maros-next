import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NotePage } from "@/notes/domain";
import { useNoteAutosave } from "./useNoteAutosave";

const { saveNoteContentMock } = vi.hoisted(() => ({
  saveNoteContentMock: vi.fn(),
}));

vi.mock("@/notes/actions/noteActions", () => ({
  saveNoteContentAction: (...args: unknown[]) => saveNoteContentMock(...args),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const baseline = {
  id: 42,
  parentId: null,
  kind: "page",
  title: "Untitled",
  icon: null,
  position: 1000,
  isFavorite: false,
  visibility: "private",
  isShared: false,
  isPublished: false,
  entityKind: null,
  entityId: null,
  ownerId: 7,
  deletedAt: null,
  createdAt: "2026-08-09T20:00:00.000Z",
  updatedAt: "2026-08-09T20:00:00.000Z",
  lastEditedBy: null,
  tags: [],
  // The API stores a newly created page as `{}`; NoteEditor turns that into an
  // empty TipTap document only at render time.
  content: {},
  myAccess: "owner",
} satisfies NotePage;

describe("useNoteAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    saveNoteContentMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retries a failed first save without requiring another edit", async () => {
    const draft = { type: "doc", content: [{ type: "paragraph" }] };
    saveNoteContentMock
      .mockResolvedValueOnce({
        success: false,
        error: "Temporary network failure",
        kind: "network",
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          ...baseline,
          content: draft,
          updatedAt: "2026-08-09T20:00:01.000Z",
        },
      });

    const { result } = renderHook(() => useNoteAutosave(42), { wrapper });
    act(() => {
      result.current.setBaseline(baseline);
      result.current.scheduleSave(draft);
      vi.advanceTimersByTime(800);
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(saveNoteContentMock).toHaveBeenCalledTimes(1);
    expect(saveNoteContentMock.mock.calls[0]?.[2]).toBeUndefined();
    expect(result.current.status).toBe("retrying");

    await act(async () => {
      vi.advanceTimersByTime(1_000);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(saveNoteContentMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("saved");

    const laterDraft = {
      type: "doc",
      content: [{ type: "paragraph" }, { type: "paragraph" }],
    };
    saveNoteContentMock.mockResolvedValueOnce({
      success: true,
      data: {
        ...baseline,
        content: laterDraft,
        updatedAt: "2026-08-09T20:00:02.000Z",
      },
    });
    act(() => {
      result.current.scheduleSave(laterDraft);
      vi.advanceTimersByTime(800);
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(saveNoteContentMock).toHaveBeenCalledTimes(3);
    expect(saveNoteContentMock.mock.calls[2]?.[2]).toBe(
      "2026-08-09T20:00:01.000Z",
    );
  });
});
