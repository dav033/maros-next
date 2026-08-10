import type { HttpClientLike } from "@/shared/infra";
import { optimizedApiClient } from "@/shared/infra";
import type { AppNotification, NotificationsRepositoryPort } from "@/features/notifications/domain";

import { endpoints } from "./endpoints";

export class NotificationsHttpRepository implements NotificationsRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async list(unreadOnly?: boolean, limit?: number): Promise<AppNotification[]> {
    const { data } = await this.api.get<AppNotification[]>(endpoints.list(), {
      params: { unreadOnly, limit },
    });
    return Array.isArray(data) ? data : [];
  }

  async unreadCount(): Promise<number> {
    const { data } = await this.api.get<{ count: number }>(endpoints.unreadCount());
    return data?.count ?? 0;
  }

  async markRead(id: number): Promise<void> {
    await this.api.post<void>(endpoints.markRead(id));
  }

  async markAllRead(): Promise<void> {
    await this.api.post<void>(endpoints.markAllRead());
  }
}
