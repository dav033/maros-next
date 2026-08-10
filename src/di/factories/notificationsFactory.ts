import type { NotificationsAppContext } from "@/notifications";
import { makeNotificationsAppContext, NotificationsHttpRepository } from "@/notifications";

export function createNotificationsAppContext(): NotificationsAppContext {
  return makeNotificationsAppContext({
    repos: { notification: new NotificationsHttpRepository() },
  });
}
