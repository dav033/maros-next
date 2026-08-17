"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TaskDetail, TaskPatch } from "@/tasks/domain";
import { tasksKeys } from "@/tasks/application";
import { useTasksApp } from "@/di";

export function TaskWorkSection({ task, onSavePatch }: { task: TaskDetail; onSavePatch: (patch: TaskPatch) => Promise<boolean> }) {
  const ctx = useTasksApp();
  const queryClient = useQueryClient();
  const dependencies = useQuery({
    queryKey: [...tasksKeys.detail(task.id), "dependencies"],
    queryFn: () => ctx.repos.task.listDependencies(task.id),
  });
  const [dependencyText, setDependencyText] = useState("");
  const [estimated, setEstimated] = useState(task.estimatedHours == null ? "" : String(task.estimatedHours));
  const timer = useMutation({
    mutationFn: (action: "start" | "stop") => action === "start" ? ctx.repos.task.startTimer(task.id) : ctx.repos.task.stopTimer(task.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: tasksKeys.detail(task.id) }),
  });
  const saveDependencies = useMutation({
    mutationFn: () => ctx.repos.task.setDependencies(task.id, dependencyText.split(",").map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0)),
    onSuccess: (ids) => {
      setDependencyText("");
      void queryClient.setQueryData([...tasksKeys.detail(task.id), "dependencies"], ids);
    },
  });

  return (
    <div className="grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-2">
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><GitBranch className="h-3.5 w-3.5" />Dependencies</div>
        <p className="text-xs text-muted-foreground">{dependencies.data?.length ? dependencies.data.map((id) => `T-${id}`).join(", ") : "No blocking tasks"}</p>
        <div className="flex gap-2">
          <Input value={dependencyText} onChange={(event) => setDependencyText(event.target.value)} placeholder="IDs: 12, 18" className="h-8 text-xs" />
          <Button type="button" size="sm" variant="outline" className="h-8" disabled={!dependencyText.trim() || saveDependencies.isPending} onClick={() => saveDependencies.mutate()}>Set</Button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />Hours</div>
        <div className="flex items-center gap-2">
          <Input value={estimated} onChange={(event) => setEstimated(event.target.value)} onBlur={() => void onSavePatch({ estimatedHours: estimated ? Number(estimated) : null })} inputMode="decimal" placeholder="Estimated" className="h-8 w-24 text-xs" />
          <span className="text-xs text-muted-foreground">est. · {Number(task.actualHours ?? 0).toFixed(1)} actual</span>
        </div>
        <Button type="button" size="sm" variant={task.startedAt ? "default" : "outline"} className="h-8 gap-1.5" disabled={timer.isPending} onClick={() => timer.mutate(task.startedAt ? "stop" : "start")}>
          <Clock3 className="h-3.5 w-3.5" />{task.startedAt ? "Stop timer" : "Start timer"}
        </Button>
      </div>
    </div>
  );
}
