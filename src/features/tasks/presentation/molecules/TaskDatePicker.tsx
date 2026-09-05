"use client";

import { useState } from "react";
import { addDays, format, isValid, nextMonday, parse } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DATE_FORMAT = "yyyy-MM-dd";

function toDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

const PRESETS: Array<{ label: string; resolve: () => Date }> = [
  { label: "Today", resolve: () => new Date() },
  { label: "Tomorrow", resolve: () => addDays(new Date(), 1) },
  // nextMonday(today) returns the *following* Monday even when today already is one —
  // exactly "next Monday" as a person means it, not "today" as an edge case surprise.
  { label: "Monday", resolve: () => nextMonday(new Date()) },
];

/**
 * The one date input the task views use — start date, due date, and (via presets, in
 * obra a date is almost always relative) construction-site-friendly shortcuts. Same
 * Calendar+Popover every other date field in the app uses, not the native
 * `<input type="date">` the task sheet used to render, whose styling and keyboard
 * behavior varies by browser. See PLAN-TAREAS-V2.md §4.3.
 */
export function TaskDatePicker({
  value,
  onChange,
  placeholder = "No date",
  className,
  dataTask,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  dataTask?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = toDate(value);

  const choose = (date: Date | undefined) => {
    onChange(date ? format(date, DATE_FORMAT) : null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <PopoverTrigger asChild>
        <Button
          data-task={dataTask}
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start gap-2 px-3 text-left font-normal",
            !selected && "text-muted-foreground",
            selected && "pr-10",
            className
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 truncate">{selected ? format(selected, "MMM d, yyyy") : placeholder}</span>
        </Button>
        </PopoverTrigger>
        {selected && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear date"
            onClick={() => choose(undefined)}
            className="absolute right-1 top-1/2 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex items-center gap-1 border-b border-border/60 p-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 flex-1 text-xs"
              onClick={() => choose(preset.resolve())}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={choose}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
