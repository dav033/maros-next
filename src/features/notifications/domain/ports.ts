import type { AppNotification } from "./models";

export interface NotificationsRepositoryPort {
  list(unreadOnly?: boolean, limit?: number): Promise<AppNotification[]>;
  unreadCount(): Promise<number>;
  markRead(id: number): Promise<void>;
  markAllRead(): Promise<void>;
}
