"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Tag, Trash2, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_STATUSES } from "@/tasks/domain";
import type { TaskBulkResult, TaskStatus } from "@/tasks/domain";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { useInstantTaskLabels } from "../hooks/data/useInstantTaskLabels";
import { AssigneePicker } from "../molecules/AssigneePicker";
import { LabelPicker } from "../molecules/LabelPicker";
import { BlockedReasonDialog } from "../molecules/BlockedReasonDialog";
import { TASK_STATUS_LABELS } from "../atoms/taskVisualTokens";

/** Every task keeps its own outcome (TaskBulkResult) — one bad row never blocks the rest of a bulk action. This is the toolbar's shared way of surfacing that. */
function reportPartialFailure(result: TaskBulkResult, verb: string) {
  if (result.failed.length === 0) return;
  toast.error(
    result.failed.length === 1
      ? `1 task couldn't be ${verb}.`
      : `${result.failed.length} tasks couldn't be ${verb}.`
  );
}

/**
 * Appears once the list's checkboxes have a selection — see TasksListPageView, which
 * owns the selected-id state (EntityTable already supports it generically; this is
 * task-specific only in which actions it offers). Every action here hits a `/bulk/*`
 * endpoint, not N individual requests — see TasksService.runBulk on the backend.
 */
export function TaskBulkActionBar({
  selectedIds,
  onClear,
}: {
  selectedIds: Set<number | string>;
  onClear: () => void;
}) {
  const taskIds = Array.from(selectedIds, Number);
  const count = taskIds.length;

  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { labels: allLabels } = useInstantTaskLabels();
  const { bulkSetAssigneeMutation, bulkSetStatusMutation, bulkAddLabelsMutation, bulkDeleteMutation } =
    useTaskMutations();

  if (count === 0) return null;

  const applyStatus = (status: TaskStatus, blockedReason?: string) => {
    bulkSetStatusMutation.mutate(
      { taskIds, status, blockedReason },
      { onSuccess: (result) => reportPartialFailure(result, "moved") }
    );
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-lg">
        <span className="px-1.5 text-sm font-medium">
          {count} selected
        </span>

        <AssigneePicker
          onSelect={(user) =>
            bulkSetAssigneeMutation.mutate(
              { taskIds, userId: user?.id ?? null },
              { onSuccess: (result) => reportPartialFailure(result, "assigned") }
            )
          }
          trigger={
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />
              Assign
            </Button>
          }
        />

        <Select
          value=""
          onValueChange={(status) => {
            const next = status as TaskStatus;
            if (next === "blocked") {
              setPendingStatus(next);
              return;
            }
            applyStatus(next);
          }}
        >
          <SelectTrigger className="h-8 w-auto gap-1.5 border-none bg-transparent px-2 text-sm shadow-none hover:bg-accent/60">
            <SelectValue placeholder="Move to…" />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <LabelPicker
          labels={allLabels}
          selectedIds={new Set()}
          onToggle={(labelId) =>
            bulkAddLabelsMutation.mutate(
              { taskIds, labelIds: [labelId] },
              { onSuccess: (result) => reportPartialFailure(result, "labeled") }
            )
          }
          trigger={
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Label
            </Button>
          }
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-destructive hover:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Clear selection"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <BlockedReasonDialog
        open={pendingStatus === "blocked"}
        onCancel={() => setPendingStatus(null)}
        onConfirm={(reason) => {
          applyStatus("blocked", reason);
          setPendingStatus(null);
        }}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {count} {count === 1 ? "task" : "tasks"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Each task's direct subtasks go with it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                bulkDeleteMutation.mutate(
                  { taskIds },
                  {
                    onSuccess: (result) => {
                      reportPartialFailure(result, "deleted");
                      onClear();
                    },
                  }
                );
                setConfirmDelete(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
