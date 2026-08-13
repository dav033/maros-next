import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tasksKeys } from "@/tasks/application";
import { useTaskEventsStream } from "./useTaskEventsStream";

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

  it("invalidates board, lists, mine and the task's detail on a valid task.changed event", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useTaskEventsStream(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    FakeEventSource.instances[0].emit("task.changed", '{"taskId":42,"actorId":7}');

    const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(invalidatedKeys).toContainEqual(tasksKeys.board());
    expect(invalidatedKeys).toContainEqual(tasksKeys.lists());
    expect(invalidatedKeys).toContainEqual(tasksKeys.mine());
    expect(invalidatedKeys).toContainEqual(tasksKeys.detail(42));
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
