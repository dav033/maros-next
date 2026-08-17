"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Drives the detail sheet from a `?task=id` query param, so the link is shareable. */
export function useTaskDetailRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get("task");
  const parsed = raw ? Number(raw) : NaN;
  const taskId = Number.isFinite(parsed) ? parsed : null;

  const openTask = useCallback(
    (id: number) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("task", String(id));
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname]
  );

  const closeTask = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("task");
    const query = next.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [router, pathname, searchParams]);

  return { taskId, openTask, closeTask };
}
