import { api } from "@/shared/infra";

const BASE = api.resource("notifications");

export const endpoints = {
  list: () => BASE,
  unreadCount: () => `${BASE}/unread-count`,
  markRead: (id: number) => `${BASE}/${id}/read`,
  markAllRead: () => `${BASE}/read-all`,
  preferences: () => "/users/me/notification-preferences",
} as const;
