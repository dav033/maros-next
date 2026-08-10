import { createEntityKeys } from "@/shared/query";

const base = createEntityKeys("notifications");

export const notificationsKeys = {
  ...base,
  unreadCount: () => [...base.all, "unreadCount"] as const,
} as const;
