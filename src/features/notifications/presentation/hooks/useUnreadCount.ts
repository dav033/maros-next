"use client";

import { useQuery } from "@tanstack/react-query";
import { useNotificationsApp } from "@/di";
import { notificationsKeys, getUnreadCount } from "@/notifications/application";
import { STALE_TIMES } from "@/shared/lib/queryClient";

/**
 * The bell is mounted twice on purpose — once in the mobile header (AppShell)
 * and once in the sidebar footer (AppSidebar) — because they are different
 * breakpoints, not duplicates. Both observers share this query key, so the
 * count is fetched once for the pair.
 *
 * `refetchOnWindowFocus` is left at the app default (false, see queryClient).
 * It used to be forced back on here, which cost a second request for a 12-byte
 * response on every load; `refetchInterval` already keeps the badge fresh.
 */
export function useUnreadCount(): number {
  const ctx = useNotificationsApp();
  const query = useQuery<number, Error>({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: () => getUnreadCount(ctx),
    staleTime: STALE_TIMES.volatile,
    refetchInterval: 60_000,
  });
  return query.data ?? 0;
}
