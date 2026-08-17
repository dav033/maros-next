"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { TaskActivityEntry, TaskComment } from "@/tasks/domain";
import { cn } from "@/lib/utils";
import { TaskCommentList } from "./TaskCommentList";

function commentText(body: Record<string, unknown>): string {
  const parts: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") parts.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(body);
  return parts.join(" ").replace(/\s+/g, " ").trim() || "Comment added";
}

export function TaskTimeline({
  taskId,
  activity,
  comments,
}: {
  taskId: number;
  activity: TaskActivityEntry[];
  comments: TaskComment[];
}) {
  const [commentsOnly, setCommentsOnly] = useState(false);
  const entries = [
    ...activity.map((entry) => ({ kind: "activity" as const, date: entry.createdAt, entry })),
    ...comments.map((comment) => ({ kind: "comment" as const, date: comment.createdAt, comment })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const visibleEntries = commentsOnly ? entries.filter((item) => item.kind === "comment") : entries;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Activity and comments, newest first</p>
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" aria-pressed={commentsOnly} onClick={() => setCommentsOnly((value) => !value)}>
          {commentsOnly ? "Show all" : "Comments only"}
        </Button>
      </div>
      <div className="space-y-2">
        {visibleEntries.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : null}
        {visibleEntries.map((item) => (
          <div key={`${item.kind}-${item.kind === "activity" ? item.entry.id : item.comment.id}`} className="flex gap-3 rounded-lg border border-border/50 px-3 py-2">
            <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", item.kind === "comment" ? "bg-primary" : "bg-muted-foreground/50")} />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                {item.kind === "comment" ? `${item.comment.author?.name ?? item.comment.author?.email ?? "Someone"} commented` : item.entry.kind.replaceAll("_", " ")}
              </p>
              {item.kind === "comment" ? <p className="mt-1 text-sm text-foreground">{commentText(item.comment.body)}</p> : null}
              <time className="mt-1 block text-[10px] text-muted-foreground" dateTime={item.date}>{new Date(item.date).toLocaleString()}</time>
            </div>
          </div>
        ))}
      </div>
      <TaskCommentList taskId={taskId} comments={comments} showComments={false} />
    </div>
  );
}
