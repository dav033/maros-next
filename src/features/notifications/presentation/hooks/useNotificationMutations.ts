"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEntityMutation } from "@/shared/presentation/hooks/useEntityMutation";
import { notificationsKeys } from "@/notifications/application";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/notifications/actions/notificationActions";

function invalidateAfterChange(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: notificationsKeys.lists() });
  void qc.invalidateQueries({ queryKey: notificationsKeys.unreadCount() });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  // Plain useMutation, not useEntityMutation: marking one notification read on click
  // is silent by design — a toast on every click would be noise, not feedback.
  const markReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationReadAction(id),
    onSuccess: () => invalidateAfterChange(queryClient),
  });

  const markAllReadMutation = useEntityMutation({
    entityLabel: "Notification",
    action: "updated",
    successMessage: "All caught up",
    mutationFn: () => markAllNotificationsReadAction(),
    invalidate: (qc) => invalidateAfterChange(qc),
  });

  return { markReadMutation, markAllReadMutation };
}
