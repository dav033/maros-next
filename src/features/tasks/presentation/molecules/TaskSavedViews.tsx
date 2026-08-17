"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Link2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasksViewState, type TasksViewState } from "../hooks/useTasksViewState";
import { useTasksApp } from "@/di";
import { tasksKeys } from "@/tasks/application";

export function TaskSavedViews() {
  const { state, replaceState } = useTasksViewState();
  const ctx = useTasksApp();
  const queryClient = useQueryClient();
  const { data: views = [] } = useQuery({ queryKey: tasksKeys.savedViews(), queryFn: () => ctx.repos.task.listSavedViews() });
  const createMutation = useMutation({ mutationFn: (input: { name: string; shared: boolean }) => ctx.repos.task.createSavedView(input.name, {
    scope: state.scope, job: state.job, view: state.view, group: state.group, sort: state.sort, direction: state.direction,
    q: state.q, status: state.status, assignee: state.assignee, label: state.label, kind: state.kind, priority: state.priority, due: state.due,
  }, input.shared), onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKeys.savedViews() }) });
  const deleteMutation = useMutation({ mutationFn: (id: number) => ctx.repos.task.deleteSavedView(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKeys.savedViews() }) });

  const saveCurrent = () => {
    const name = window.prompt("Name this task view");
    if (!name?.trim()) return;
    createMutation.mutate({ name: name.trim(), shared: window.confirm("Share this view with the workspace?") });
  };

  const remove = (id: number) => deleteMutation.mutate(id);

  return (
    <div className="flex items-center gap-1.5">
      <Bookmark className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      <select
        aria-label="Saved task views"
        value=""
        onChange={(event) => {
          const view = views.find((candidate) => candidate.id === Number(event.target.value));
          if (view) replaceState(view.state as Partial<TasksViewState>);
        }}
        className="h-8 max-w-40 rounded-md border border-border/60 bg-background px-2 text-xs text-muted-foreground"
      >
        <option value="">Saved views</option>
        {views.map((view) => <option key={view.id} value={view.id}>{view.name}{view.shared ? " · shared" : ""}</option>)}
      </select>
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={saveCurrent} aria-label="Save current task view">
        <Plus className="h-3.5 w-3.5" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => void navigator.clipboard?.writeText(window.location.href)} aria-label="Copy shareable task view link" title="Copy shareable link">
        <Link2 className="h-3.5 w-3.5" />
      </Button>
      {views.length > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
          onClick={() => remove(views[views.length - 1].id)}
          aria-label="Delete last saved task view"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
