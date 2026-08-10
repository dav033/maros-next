"use client";

import { useQuery } from "@tanstack/react-query";
import { useNotificationsApp } from "@/di";
import { notificationsKeys, getUnreadCount } from "@/notifications/application";

export function useUnreadCount(): number {
  const ctx = useNotificationsApp();
  const query = useQuery<number, Error>({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: () => getUnreadCount(ctx),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
  return query.data ?? 0;
}
