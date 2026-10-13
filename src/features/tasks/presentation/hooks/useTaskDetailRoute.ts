"use client";

import { useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Drives the detail sheet from a `?task=id` query param, so the link is shareable. */
export function useTaskDetailRoute() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get("task");
  const parsed = raw ? Number(raw) : NaN;
  const taskId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  const openedInternally = useRef(false);

  const openTask = useCallback(
    (id: number) => {
      const next = new URLSearchParams(window.location.search);
      const alreadyOpen = next.has("task");
      next.set("task", String(id));
      if (!alreadyOpen) {
        openedInternally.current = true;
        window.history.pushState(null, "", `${pathname}?${next.toString()}`);
      } else {
        window.history.replaceState(null, "", `${pathname}?${next.toString()}`);
      }
    },
    [pathname]
  );

  const closeTask = useCallback(() => {
    if (openedInternally.current) {
      openedInternally.current = false;
      window.history.back();
      return;
    }
    const next = new URLSearchParams(window.location.search);
    next.delete("task");
    const query = next.toString();
    window.history.replaceState(null, "", `${pathname}${query ? `?${query}` : ""}`);
  }, [pathname]);

  return { taskId, openTask, closeTask };
}
