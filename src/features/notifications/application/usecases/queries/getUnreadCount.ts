import type { NotificationsAppContext } from "@/notifications";

export async function getUnreadCount(ctx: NotificationsAppContext): Promise<number> {
  return ctx.repos.notification.unreadCount();
}
