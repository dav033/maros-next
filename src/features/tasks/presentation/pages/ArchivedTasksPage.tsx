"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, RotateCcw } from "lucide-react";
import { PageHeaderCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useTasksApp } from "@/di";
import { tasksKeys } from "@/tasks/application";
import type { Task } from "@/tasks/domain";

export function ArchivedTasksPage() {
  const ctx = useTasksApp();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: tasksKeys.archived(), queryFn: () => ctx.repos.task.listArchived() });
  const restore = useMutation({
    mutationFn: (id: number) => ctx.repos.task.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKeys.archived() }),
  });
  const tasks = (query.data ?? []) as Task[];
  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <PageHeaderCard icon={Archive} title="Archived tasks" description="Restore tasks and their subtasks when work resumes." />
      <section className="rounded-xl border border-border bg-card">
        {tasks.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No archived tasks.</p> : tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 border-b border-border/60 px-4 py-3 last:border-0">
            <span className="min-w-0 flex-1 truncate text-sm font-medium">T-{task.id} · {task.title}</span>
            <span className="text-xs text-muted-foreground">{new Date(task.updatedAt).toLocaleDateString()}</span>
            <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5" disabled={restore.isPending} onClick={() => restore.mutate(task.id)}><RotateCcw className="h-3.5 w-3.5" />Restore</Button>
          </div>
        ))}
      </section>
    </div>
  );
}
