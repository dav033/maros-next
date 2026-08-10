"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/notifications/domain";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { useInstantNotifications } from "../hooks/useInstantNotifications";
import { useNotificationMutations } from "../hooks/useNotificationMutations";

function describe(notification: AppNotification): string {
  const who = notification.actor?.name ?? notification.actor?.email ?? "Someone";
  const title =
    typeof notification.payload.taskTitle === "string" ? notification.payload.taskTitle : "a task";
  switch (notification.kind) {
    case "task_assigned":
      return `${who} assigned you "${title}"`;
    case "task_status_changed":
      return `${who} moved "${title}" to ${String(notification.payload.to ?? "a new status")}`;
    case "task_blocked":
      return `${who} blocked "${title}"`;
    case "task_commented":
      return `${who} commented on "${title}"`;
    case "task_due_digest":
      return `"${title}" is due`;
    default:
      return `Update on "${title}"`;
  }
}

function taskHref(notification: AppNotification): string | null {
  const taskId = notification.payload.taskId;
  return typeof taskId === "number" ? `/tasks?task=${taskId}` : null;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = useUnreadCount();
  const { notifications, isLoading } = useInstantNotifications(open);
  const { markReadMutation, markAllReadMutation } = useNotificationMutations();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
          className="relative grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="top">
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {notifications.some((n) => !n.readAt) ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => markAllReadMutation.mutate(undefined)}
            >
              <Check className="h-3 w-3" />
              Mark all read
            </Button>
          ) : null}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nothing yet.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {notifications.map((notification) => {
                const href = taskHref(notification);
                const content = (
                  <div
                    className={cn(
                      "flex flex-col gap-0.5 px-3 py-2.5 text-sm hover:bg-accent/40",
                      !notification.readAt && "bg-primary/5"
                    )}
                  >
                    <p className="text-foreground/90">{describe(notification)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                );

                return (
                  <li key={notification.id}>
                    {href ? (
                      <Link
                        href={href}
                        onClick={() => {
                          if (!notification.readAt) markReadMutation.mutate(notification.id);
                          setOpen(false);
                        }}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="block w-full text-left"
                        onClick={() => {
                          if (!notification.readAt) markReadMutation.mutate(notification.id);
                        }}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
