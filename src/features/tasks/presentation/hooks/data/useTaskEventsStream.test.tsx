import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tasksKeys } from "@/tasks/application";
import type { TaskDetail } from "@/tasks/domain";
import { useTaskEventsStream } from "./useTaskEventsStream";

const { taskGet } = vi.hoisted(() => ({ taskGet: vi.fn() }));
vi.mock("@/di", () => ({
  useTasksApp: () => ({ repos: { task: { get: taskGet } } }),
}));

type Listener = (event: { data: string }) => void;

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  url: string;
  options: EventSourceInit | undefined;
  closed = false;
  private listeners: Record<string, Listener[]> = {};

  constructor(url: string, options?: EventSourceInit) {
    this.url = url;
    this.options = options;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: Listener) {
    (this.listeners[type] ??= []).push(listener);
  }

  close() {
    this.closed = true;
  }

  emit(type: string, data: string) {
    for (const listener of this.listeners[type] ?? []) listener({ data });
  }
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useTaskEventsStream", () => {
  beforeEach(() => {
    FakeEventSource.instances = [];
    taskGet.mockReset();
    vi.stubGlobal("EventSource", FakeEventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens a credentialed connection to the tasks events stream", () => {
    renderHook(() => useTaskEventsStream(), { wrapper });

    expect(FakeEventSource.instances).toHaveLength(1);
    expect(FakeEventSource.instances[0].url).toMatch(/\/tasks\/events\/stream$/);
    expect(FakeEventSource.instances[0].options).toEqual({ withCredentials: true });
  });

  it("refreshes the affected task detail on a valid task.changed event", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const detail = {
      id: 42,
      parentId: null,
      title: "Updated task",
      kind: "general",
      status: "todo",
      priority: "normal",
      position: 0,
      assignee: null,
      reporter: null,
      entityKind: null,
      entityId: null,
      entity: null,
      startDate: null,
      dueDate: null,
      blockedReason: null,
      completedAt: null,
      labels: [],
      subtasksTotal: 0,
      subtasksDone: 0,
      commentsCount: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:01.000Z",
      description: {},
      createdBy: null,
      attachments: [],
      subtasks: [],
      activity: [],
      comments: [],
      parties: [],
    } as TaskDetail;
    taskGet.mockResolvedValue(detail);
    renderHook(() => useTaskEventsStream(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    FakeEventSource.instances[0].emit("task.changed", '{"taskId":42,"actorId":7}');

    await waitFor(() => expect(queryClient.getQueryData(tasksKeys.detail(42))).toEqual(detail));
    expect(taskGet).toHaveBeenCalledWith(42);
  });

  it("ignores a malformed task.changed payload without invalidating anything", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useTaskEventsStream(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    FakeEventSource.instances[0].emit("task.changed", "not json");

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("closes the connection on unmount", () => {
    const { unmount } = renderHook(() => useTaskEventsStream(), { wrapper });
    const instance = FakeEventSource.instances[0];

    unmount();

    expect(instance.closed).toBe(true);
  });
});
