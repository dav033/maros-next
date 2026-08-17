"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PageHeaderCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useTaskDetailRoute } from "../hooks/useTaskDetailRoute";
import { useInstantTaskSchedule } from "../hooks/data/useInstantTaskSchedule";
import { TaskViewSwitcher } from "../molecules/TaskViewSwitcher";
import { TaskScopeBar } from "../molecules/TaskScopeBar";
import { TaskSavedViews } from "../molecules/TaskSavedViews";
import { useTasksViewState } from "../hooks/useTasksViewState";
import { TaskKindIcon } from "../atoms/TaskKindIcon";
import { TaskPriorityBadge } from "../atoms/TaskPriorityBadge";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { TaskDetailSheet } from "../organisms/TaskDetailSheet";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { assigneeLoad, groupTasksByAssignee, taskDurationDays, taskIsOnCalendarDay, CALENDAR_CAPACITY_HOURS } from "./taskCalendar";

export function TaskCalendarPageView() {
  const { taskId, openTask, closeTask } = useTaskDetailRoute();
  const { state } = useTasksViewState();
  const searchParams = useSearchParams();
  const { rescheduleMutation } = useTaskMutations();
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [week, setWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  useEffect(() => {
    const from = searchParams.get("from");
    if (!from || !/^\d{4}-\d{2}-\d{2}$/.test(from)) return;
    const parsed = new Date(`${from}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) setWeek(startOfWeek(parsed, { weekStartsOn: 1 }));
  }, [searchParams]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(week, index)), [week]);
  const { tasks, isPending } = useInstantTaskSchedule({
    from: format(days[0], "yyyy-MM-dd"),
    to: format(days[6], "yyyy-MM-dd"),
    assigneeUserId: state.assignee.length ? state.assignee : undefined,
    jobId: state.job ?? undefined,
    leadType: state.scope !== "all" ? state.scope as "CONSTRUCTION" | "ROOFING" | "PLUMBING" : undefined,
  });
  const rows = useMemo(() => groupTasksByAssignee(tasks), [tasks]);

  const handleDrop = (dayKey: string, assigneeId: number | null) => {
    const task = tasks.find((candidate) => candidate.id === draggedTaskId);
    if (!task) return;
    const duration = taskDurationDays(task);
    const dueDate = format(addDays(new Date(`${dayKey}T00:00:00`), duration), "yyyy-MM-dd");
    rescheduleMutation.mutate({ id: task.id, input: { startDate: dayKey, dueDate, assigneeUserId: assigneeId } });
    setDraggedTaskId(null);
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-3 sm:gap-4">
      <PageHeaderCard icon={CalendarDays} title="Task calendar" description="Schedule work by day, job, and responsible person." belowSlot={<div className="flex flex-wrap items-center gap-3"><TaskViewSwitcher current="calendar" /><TaskScopeBar /><TaskSavedViews /></div>} />
      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setWeek((current) => addDays(current, -7))} aria-label="Previous week"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="text-sm font-medium">{format(days[0], "MMM d")} – {format(days[6], "MMM d, yyyy")}</span>
        <Button type="button" variant="ghost" size="sm" onClick={() => setWeek((current) => addDays(current, 7))} aria-label="Next week"><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <section className="min-w-[980px] overflow-x-auto rounded-xl border border-border/60 bg-card">
        <div className="grid grid-cols-[12rem_repeat(7,minmax(9rem,1fr))] border-b border-border/60 bg-muted/20">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Assignee</div>
          {days.map((day) => <div key={format(day, "yyyy-MM-dd")} className="border-l border-border/40 px-3 py-2"><p className="text-xs font-semibold">{format(day, "EEE")}</p><p className="text-xs text-muted-foreground">{format(day, "MMM d")}</p></div>)}
        </div>
        {isPending ? <div className="p-6 text-sm text-muted-foreground">Loading schedule…</div> : null}
        {rows.map((row) => {
          const { hours: load, overloaded } = assigneeLoad(row.tasks, format(days[0], "yyyy-MM-dd"), format(days[6], "yyyy-MM-dd"));
          return <div key={row.id ?? "unassigned"} className="grid grid-cols-[12rem_repeat(7,minmax(9rem,1fr))] border-b border-border/40 last:border-0">
            <div className="flex items-start gap-2 px-3 py-3"><AssigneeAvatar person={row.tasks[0]?.assignee ?? null} /><div><p className="text-xs font-medium">{row.label}</p><p className={overloaded ? "text-[10px] font-semibold text-destructive" : "text-[10px] text-muted-foreground"}>{load.toFixed(1)} / {CALENDAR_CAPACITY_HOURS}h{overloaded ? " · overloaded" : ""}</p></div></div>
            {days.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              return <div key={dayKey} className="min-h-28 border-l border-border/40 p-1.5" onDragOver={(event) => event.preventDefault()} onDrop={() => handleDrop(dayKey, row.id)}>
                <div className="space-y-1.5">{row.tasks.filter((task) => taskIsOnCalendarDay(task, dayKey)).map((task) => <button key={task.id} type="button" draggable onDragStart={() => setDraggedTaskId(task.id)} onDragEnd={() => setDraggedTaskId(null)} onClick={() => openTask(task.id)} className="flex w-full flex-col gap-1 rounded-lg border border-border/60 bg-background p-2 text-left hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex items-center gap-1.5"><TaskKindIcon kind={task.kind} /><span className="line-clamp-2 text-xs font-medium">{task.title}</span></span><span className="flex items-center justify-between gap-1"><AssigneeAvatar person={task.assignee} /><TaskPriorityBadge priority={task.priority} showLabel={false} pill /></span></button>)}</div>
              </div>;
            })}
          </div>;
        })}
        {!isPending && rows.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No scheduled tasks in this week.</p> : null}
      </section>
      <TaskDetailSheet taskId={taskId} onClose={closeTask} onOpenTask={openTask} />
    </div>
  );
}
