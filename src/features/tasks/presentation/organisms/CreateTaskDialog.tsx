"use client";

import { useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Link2, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_KINDS, TASK_PRIORITIES } from "@/tasks/domain";
import type { TaskEntityKind, TaskEntityLink, TaskKind, TaskPriority } from "@/tasks/domain";
import { useInstantTaskLabels } from "../hooks/data/useInstantTaskLabels";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { TaskKindIcon } from "../atoms/TaskKindIcon";
import { AssigneePicker } from "../molecules/AssigneePicker";
import { TaskDatePicker } from "../molecules/TaskDatePicker";
import { LabelPicker } from "../molecules/LabelPicker";
import { TaskEntityPicker } from "../molecules/TaskEntityPicker";
import { TaskRichTextEditor } from "../molecules/TaskRichTextEditor";
import { isBlankDoc } from "../molecules/taskRichTextDoc";
import { TASK_KIND_LABELS, TASK_PRIORITY_LABELS, taskLabelColor } from "../atoms/taskVisualTokens";

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

const ENTITY_KIND_LABEL: Record<TaskEntityKind, string> = {
  lead: "Lead",
  project: "Project",
  contact: "Contact",
  company: "Company",
};

export function CreateTaskDialog({
  onCreated,
  defaultEntityKind,
  defaultEntityId,
  defaultAssigneeId,
  defaultAssigneeLabel,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  onCreated?: (id: number) => void;
  /** Preselects the linked record — e.g. EntityTasksSection on a lead/project page. Locked in, not offered as a picker: the context that opened this dialog already decided it. */
  defaultEntityKind?: TaskEntityKind;
  defaultEntityId?: number;
  /** Preselects the assignee — e.g. MyTasksPageView defaults to yourself, since an
   *  unassigned task created there would immediately disappear from that same view. */
  defaultAssigneeId?: number;
  defaultAssigneeLabel?: string;
  trigger?: ReactNode;
  /**
   * Headless mode: pass both to drive the dialog from outside (no trigger button
   * rendered at all) — see TaskKeyboardShortcuts' `c` shortcut. Omit both for the
   * normal button-triggered dialog every page header already uses.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    controlledOnOpenChange?.(next);
  };
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TaskKind>("general");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [assigneeUserId, setAssigneeUserId] = useState<number | null>(defaultAssigneeId ?? null);
  const [assigneeLabel, setAssigneeLabel] = useState(defaultAssigneeLabel ?? "Unassigned");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [labelIds, setLabelIds] = useState<Set<number>>(new Set());
  const [entityLink, setEntityLink] = useState<TaskEntityLink | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [descriptionKey, setDescriptionKey] = useState(0);
  const descriptionRef = useRef<Record<string, unknown>>(EMPTY_DOC);

  const { labels: allLabels } = useInstantTaskLabels();
  const { createMutation, setLabelsMutation } = useTaskMutations();

  const linkedEntityKind = defaultEntityKind ?? entityLink?.entityKind ?? null;
  const linkedEntityId = defaultEntityId ?? entityLink?.entityId ?? null;
  const entityIsLocked = defaultEntityKind != null;

  // Kept across "create and add another" on purpose (see submit's `another` branch):
  // kind, priority, and assignee are usually the same for the next task in a batch
  // (a site visit's follow-up punch-list items, say), so only reset what's specific
  // to *this* task.
  const resetPerTaskFields = () => {
    setTitle("");
    setDueDate(null);
    setStartDate(null);
    setLabelIds(new Set());
    if (!entityIsLocked) setEntityLink(null);
    descriptionRef.current = EMPTY_DOC;
    setDescriptionKey((k) => k + 1);
  };

  const resetAll = () => {
    resetPerTaskFields();
    setKind("general");
    setPriority("normal");
    setAssigneeUserId(defaultAssigneeId ?? null);
    setAssigneeLabel(defaultAssigneeLabel ?? "Unassigned");
    setShowMore(false);
  };

  const submit = async (another: boolean) => {
    if (!title.trim() || createMutation.isPending) return;

    const result = await createMutation.mutateAsync({
      title: title.trim(),
      kind,
      priority,
      assigneeUserId: assigneeUserId ?? undefined,
      dueDate: dueDate ?? undefined,
      startDate: startDate ?? undefined,
      entityKind: linkedEntityKind ?? undefined,
      entityId: linkedEntityId ?? undefined,
      description: isBlankDoc(descriptionRef.current) ? undefined : descriptionRef.current,
    });

    // Labels aren't part of creation (CreateTaskDto has no labelIds — see the domain
    // TaskDraft type) — one extra call, same as attachments never being settable at
    // creation either.
    if (labelIds.size > 0) {
      await setLabelsMutation.mutateAsync({ id: result.id, labelIds: Array.from(labelIds) });
    }

    if (another) {
      resetPerTaskFields();
      return;
    }
    setOpen(false);
    resetAll();
    onCreated?.(result.id);
  };

  const toggleLabel = (labelId: number) => {
    setLabelIds((current) => {
      const next = new Set(current);
      if (next.has(labelId)) next.delete(labelId);
      else next.add(labelId);
      return next;
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetAll();
      }}
    >
      {isControlled ? null : (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              New task
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent
        className="sm:max-w-md"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            void submit(false);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pour foundation for unit 3"
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit(false);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Kind</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as TaskKind)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      <span className="inline-flex items-center gap-1.5">
                        <TaskKindIcon kind={k} />
                        {TASK_KIND_LABELS[k]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {TASK_PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Assignee</Label>
              <AssigneePicker
                onSelect={(user) => {
                  setAssigneeUserId(user?.id ?? null);
                  setAssigneeLabel(user?.name ?? user?.email ?? "Unassigned");
                }}
                trigger={
                  <button
                    type="button"
                    className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm hover:bg-accent/40"
                  >
                    <AssigneeAvatar person={assigneeUserId ? { id: assigneeUserId, name: assigneeLabel, email: "", picture: null } : null} />
                    <span className="truncate">{assigneeLabel}</span>
                  </button>
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Due date</Label>
              <TaskDatePicker value={dueDate} onChange={setDueDate} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {showMore ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            More details
          </button>

          {showMore ? (
            <div className="space-y-4 border-t border-border/60 pt-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <TaskRichTextEditor
                  key={descriptionKey}
                  content={EMPTY_DOC}
                  minHeightClassName="min-h-[70px]"
                  onUpdate={(doc) => {
                    descriptionRef.current = doc;
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Start date</Label>
                  <TaskDatePicker value={startDate} onChange={setStartDate} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Labels</Label>
                  <LabelPicker
                    labels={allLabels}
                    selectedIds={labelIds}
                    onToggle={toggleLabel}
                    trigger={
                      <button
                        type="button"
                        className="flex h-9 w-full items-center gap-1 rounded-md border border-input bg-transparent px-3 text-sm hover:bg-accent/40"
                      >
                        {labelIds.size > 0 ? (
                          <span className="truncate">{labelIds.size} selected</span>
                        ) : (
                          <span className="text-muted-foreground">Add labels</span>
                        )}
                      </button>
                    }
                  />
                </div>
              </div>

              {labelIds.size > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {allLabels
                    .filter((l) => labelIds.has(l.id))
                    .map((label) => (
                      <span
                        key={label.id}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${taskLabelColor(label.color)}22`,
                          color: taskLabelColor(label.color),
                        }}
                      >
                        {label.name}
                        <button type="button" onClick={() => toggleLabel(label.id)} aria-label={`Remove ${label.name}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Linked record</Label>
                {entityIsLocked ? (
                  <p className="text-xs text-muted-foreground">
                    {ENTITY_KIND_LABEL[defaultEntityKind as TaskEntityKind]} #{defaultEntityId} — set by
                    where you opened this from.
                  </p>
                ) : entityLink ? (
                  <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex-1 truncate">
                      {ENTITY_KIND_LABEL[entityLink.entityKind]} #{entityLink.entityId}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setEntityLink(null)}
                    >
                      Unlink
                    </button>
                  </div>
                ) : (
                  <TaskEntityPicker
                    onSelect={setEntityLink}
                    trigger={
                      <Button type="button" variant="outline" size="sm" className="gap-1.5">
                        <Link2 className="h-3.5 w-3.5" />
                        Link to a record
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!title.trim() || createMutation.isPending}
              onClick={() => void submit(true)}
            >
              Create and add another
            </Button>
            <Button
              type="button"
              disabled={!title.trim() || createMutation.isPending}
              onClick={() => void submit(false)}
            >
              Create task
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
