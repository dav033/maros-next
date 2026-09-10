"use client";

import { useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Drives the detail sheet from a `?task=id` query param, so the link is shareable. */
export function useTaskDetailRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get("task");
  const parsed = raw ? Number(raw) : NaN;
  const taskId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  const openedInternally = useRef(false);

  const openTask = useCallback(
    (id: number) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("task", String(id));
      if (searchParams.get("task") == null) {
        openedInternally.current = true;
        router.push(`${pathname}?${next.toString()}`, { scroll: false });
      } else {
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      }
    },
    [router, pathname, searchParams]
  );

  const closeTask = useCallback(() => {
    if (openedInternally.current) {
      openedInternally.current = false;
      router.back();
      return;
    }
    const next = new URLSearchParams(searchParams.toString());
    next.delete("task");
    const query = next.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [router, pathname, searchParams]);

  return { taskId, openTask, closeTask };
}
