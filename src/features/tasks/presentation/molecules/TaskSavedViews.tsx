"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Link2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasksApp } from "@/di";
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import { tasksKeys } from "@/tasks/application";
import { useTasksViewState, type TasksViewState } from "../hooks/useTasksViewState";

export function TaskSavedViews() {
  const { state, replaceState } = useTasksViewState();
  const { user } = useCurrentUser();
  const ctx = useTasksApp();
  const queryClient = useQueryClient();
  const [selectedViewId, setSelectedViewId] = useState<number | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [shareWithWorkspace, setShareWithWorkspace] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { data: views = [], isPending, isError, refetch } = useQuery({
    queryKey: tasksKeys.savedViews(),
    queryFn: () => ctx.repos.task.listSavedViews(),
  });
  const selectedView = views.find((view) => view.id === selectedViewId) ?? null;
  const canDeleteSelectedView = selectedView?.ownerId === user?.id;
  const createMutation = useMutation({
    mutationFn: (input: { name: string; shared: boolean }) => ctx.repos.task.createSavedView(input.name, {
      scope: state.scope, job: state.job, view: state.view, group: state.group, sort: state.sort, direction: state.direction,
      q: state.q, status: state.status, assignee: state.assignee, label: state.label, kind: state.kind, priority: state.priority, due: state.due,
      workspaceId: state.workspaceId, folderId: state.folderId,
    }, input.shared),
    onSuccess: (view) => {
      void queryClient.invalidateQueries({ queryKey: tasksKeys.savedViews() });
      setSelectedViewId(view.id);
      setNewViewName("");
      setShareWithWorkspace(false);
      setSaveDialogOpen(false);
      toast.success("Saved view created.");
    },
    onError: () => toast.error("Could not save this view."),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => ctx.repos.task.deleteSavedView(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tasksKeys.savedViews() });
      setSelectedViewId(null);
      setDeleteDialogOpen(false);
      toast.success("Saved view deleted.");
    },
    onError: () => toast.error("Could not delete this view."),
  });

  const copyShareableLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("View link copied.");
    } catch {
      toast.error("Could not copy the view link.");
    }
  };

  return (
    <>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <Bookmark className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <Select
          value={selectedView ? String(selectedView.id) : ""}
          onValueChange={(value) => {
            const view = views.find((candidate) => candidate.id === Number(value));
            if (!view) return;
            setSelectedViewId(view.id);
            replaceState(view.state as Partial<TasksViewState>);
          }}
        >
          <SelectTrigger aria-label="Saved task views" className="h-8 w-[9.5rem] text-xs" disabled={views.length === 0}>
            <SelectValue placeholder={isPending && views.length === 0 ? "Loading views…" : "Saved views"} />
          </SelectTrigger>
          <SelectContent>
            {views.map((view) => (
              <SelectItem key={view.id} value={String(view.id)}>
                {view.name}{view.shared ? " · shared" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isError ? (
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => void refetch()} aria-label="Retry loading saved views">
            <RefreshCw className="size-3.5" />
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setSaveDialogOpen(true)} aria-label="Save current task view">
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => void copyShareableLink()} aria-label="Copy shareable task view link" title="Copy shareable link">
          <Link2 className="h-3.5 w-3.5" />
        </Button>
        {canDeleteSelectedView && selectedView ? (
          <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => setDeleteDialogOpen(true)} aria-label={`Delete saved view ${selectedView.name}`} title="Delete selected view">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : null}
        {isError ? (
          <span className="text-xs text-destructive" role="status">
            {views.length > 0 ? "Could not refresh saved views." : "Could not load saved views."}
          </span>
        ) : null}
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              const name = newViewName.trim();
              if (!name || createMutation.isPending) return;
              createMutation.mutate({ name, shared: shareWithWorkspace });
            }}
          >
            <DialogHeader>
              <DialogTitle>Save this task view</DialogTitle>
              <DialogDescription>Keep the current filters, grouping, and sort order for quick access.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="saved-task-view-name">View name</Label>
              <Input id="saved-task-view-name" value={newViewName} onChange={(event) => setNewViewName(event.target.value)} maxLength={120} autoFocus />
            </div>
            <label className="flex items-start gap-3 rounded-lg border border-line p-3 text-sm">
              <Checkbox checked={shareWithWorkspace} onCheckedChange={(checked) => setShareWithWorkspace(checked === true)} />
              <span>
                <span className="block font-medium">Share with the workspace</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">Other workspace members can use this saved view.</span>
              </span>
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)} disabled={createMutation.isPending}>Cancel</Button>
              <Button type="submit" disabled={!newViewName.trim() || createMutation.isPending}>
                {createMutation.isPending ? "Saving…" : "Save view"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen && canDeleteSelectedView} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete saved view?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedView ? `“${selectedView.name}” will be removed. This cannot be undone.` : "This saved view will be removed. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Keep view</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!canDeleteSelectedView || !selectedView || deleteMutation.isPending}
              onClick={(event) => {
                if (!canDeleteSelectedView || !selectedView || deleteMutation.isPending) {
                  event.preventDefault();
                  return;
                }
                event.preventDefault();
                deleteMutation.mutate(selectedView.id);
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete view"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
