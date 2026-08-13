import { format, isValid, parse } from "date-fns";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayInBusinessTimezone } from "@/shared/lib/businessDate";

const DATE_FORMAT = "yyyy-MM-dd";

function parseDate(value: string): Date | undefined {
  const parsed = parse(value, DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

/** Colors by urgency: overdue is loud, today is a step down, everything else is quiet. */
export function DueDatePill({
  dueDate,
  className,
}: {
  dueDate: string | null;
  className?: string;
}) {
  if (!dueDate) return null;

  const parsed = parseDate(dueDate);
  if (!parsed) return null;

  // String comparison against business-timezone "today" — see businessDate.ts. Keeps
  // this pill's overdue/today styling in sync with the board's counts and the
  // backend's own bucketing, instead of the viewer's local timezone.
  const today = todayInBusinessTimezone();
  const isOverdue = dueDate < today;
  const isToday = dueDate === today;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        isOverdue
          ? "font-medium text-destructive"
          : isToday
            ? "font-medium text-amber-500"
            : "text-muted-foreground",
        className
      )}
    >
      <CalendarClock className="h-3.5 w-3.5" />
      {format(parsed, "MMM d")}
    </span>
  );
}
