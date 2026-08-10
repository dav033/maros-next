import type { NotificationsRepositoryPort } from "@/features/notifications/domain";

export type NotificationsAppContext = Readonly<{
  repos: {
    notification: NotificationsRepositoryPort;
  };
}>;

export function makeNotificationsAppContext(
  deps: NotificationsAppContext
): NotificationsAppContext {
  return deps;
}
