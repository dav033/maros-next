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
      router.push(`${pathname}?task=${id}`, { scroll: false });
    },
    [router, pathname]
  );

  const closeTask = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return { taskId, openTask, closeTask };
}
