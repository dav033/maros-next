import { format, isValid, parse, startOfDay } from "date-fns";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const today = startOfDay(new Date());
  const isOverdue = parsed < today;
  const isToday = parsed.getTime() === today.getTime();

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
