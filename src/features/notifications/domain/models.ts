export type NotificationKind =
  | "task_assigned"
  | "task_commented"
  | "task_status_changed"
  | "task_blocked"
  | "task_due_digest"
  | "task_permit_due"
  | "task_mentioned";

export interface NotificationPersonRef {
  id: number;
  name: string | null;
  email: string;
  picture: string | null;
}

export interface AppNotification {
  id: number;
  kind: NotificationKind;
  actor: NotificationPersonRef | null;
  entityKind: string | null;
  entityId: number | null;
  /** Denormalized taskId/taskTitle/etc — see the backend Notification entity. */
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export type NotificationChannel = "in_app" | "email" | "none";
export interface NotificationPreferences {
  assignment: NotificationChannel;
  status: NotificationChannel;
  blocked: NotificationChannel;
  comment: NotificationChannel;
  mention: NotificationChannel;
  permit: NotificationChannel;
  digest: NotificationChannel;
  digestHour: number;
}
