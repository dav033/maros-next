"use client";

import { useQuery } from "@tanstack/react-query";
import { useNotificationsApp } from "@/di";
import { notificationsKeys, listNotifications } from "@/notifications/application";
import type { AppNotification } from "@/notifications/domain";

/** Only fetches the list while the popover is actually open. */
export function useInstantNotifications(enabled: boolean) {
  const ctx = useNotificationsApp();
  const query = useQuery<AppNotification[], Error>({
    queryKey: notificationsKeys.list(),
    queryFn: () => listNotifications(ctx, false, 30),
    enabled,
  });
  return { notifications: query.data ?? [], isLoading: query.isPending };
}
