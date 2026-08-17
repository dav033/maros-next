"use client";

import Link from "next/link";
import { addDays, format } from "date-fns";
import { ArrowRight, Ban, CalendarClock, Users } from "lucide-react";
import { useInstantTasksBoard } from "@/features/tasks/presentation/hooks/data/useInstantTasksBoard";
import { todayInBusinessTimezone } from "@/shared/lib/businessDate";

const OPEN_STATUSES = ["backlog", "todo", "in_progress", "blocked"] as const;

export function TaskDashboardWidget() {
  const { board, showSkeleton, error } = useInstantTasksBoard({ status: [...OPEN_STATUSES] });
  const tasks = Object.values(board).flat();
  const today = todayInBusinessTimezone();
  const weekEnd = format(addDays(new Date(`${today}T00:00:00`), 7), "yyyy-MM-dd");
  const overdue = tasks.filter((task) => task.dueDate != null && task.dueDate < today);
  const dueToday = tasks.filter((task) => task.dueDate === today);
  const blocked = tasks.filter((task) => task.status === "blocked");
  const load = new Map<string, { label: string; count: number; id: number | null }>();
  for (const task of tasks) {
    const id = task.assignee?.id ?? null;
    const key = id == null ? "unassigned" : String(id);
    const current = load.get(key) ?? { label: task.assignee?.name ?? task.assignee?.email ?? "Unassigned", count: 0, id };
    current.count += 1;
    load.set(key, current);
  }
  const loadRows = [...load.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  if (showSkeleton) return <div className="h-48 animate-pulse rounded-xl border border-border bg-card" />;
  if (error) return <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Could not load task signals.</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">This week</h3>
            <p className="text-xs text-muted-foreground">Open work needing attention</p>
          </div>
          <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <SignalLink href="/tasks?due=overdue" label="Overdue" value={overdue.length} tone="text-destructive" />
          <SignalLink href="/tasks?due=today" label="Today" value={dueToday.length} tone="text-amber-600" />
          <SignalLink href="/tasks?status=blocked" label="Blocked" value={blocked.length} tone="text-violet-600" />
        </div>
        <Link href={`/tasks?view=calendar&from=${today}&to=${weekEnd}`} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Open calendar <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Load by person</h3>
            <p className="text-xs text-muted-foreground">Open tasks currently assigned</p>
          </div>
          <Users className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        {loadRows.length === 0 ? <p className="text-sm text-muted-foreground">No open tasks.</p> : (
          <div className="space-y-2">
            {loadRows.map((row) => (
              <div key={row.id ?? "unassigned"} className="flex items-center justify-between gap-3 text-sm">
                {row.id == null ? <span className="truncate text-muted-foreground">{row.label}</span> : <Link href={`/tasks?assignee=${row.id}`} className="truncate hover:underline">{row.label}</Link>}
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{row.count}</span>
              </div>
            ))}
          </div>
        )}
        <Link href="/tasks?view=board&group=assignee" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Open board <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function SignalLink({ href, label, value, tone }: { href: string; label: string; value: number; tone: string }) {
  return (
    <Link href={href} className="rounded-lg border border-border/70 p-2 transition-colors hover:bg-accent/40">
      <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Ban className="h-3 w-3" aria-hidden="true" />{label}</span>
      <span className={`text-xl font-semibold ${tone}`}>{value}</span>
    </Link>
  );
}
