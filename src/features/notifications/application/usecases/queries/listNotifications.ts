import type { NotificationsAppContext } from "@/notifications";
import type { AppNotification } from "@/notifications/domain";

export async function listNotifications(
  ctx: NotificationsAppContext,
  unreadOnly?: boolean,
  limit?: number
): Promise<AppNotification[]> {
  return ctx.repos.notification.list(unreadOnly, limit);
}
