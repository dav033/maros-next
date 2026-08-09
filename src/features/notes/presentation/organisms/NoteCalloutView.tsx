"use client";

import { useState } from "react";
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { format, isValid, parse, startOfDay } from "date-fns";
import { AlertTriangle, BellRing, CalendarPlus, Info, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  CALLOUT_VARIANTS,
  isCalloutVariant,
  type CalloutVariant,
} from "@/features/notes/config/calloutExtension";

const VARIANT_STYLE: Record<
  CalloutVariant,
  { icon: LucideIcon; label: string; tone: string }
> = {
  note: { icon: Info, label: "Note", tone: "text-sky-400" },
  warning: { icon: AlertTriangle, label: "Warning", tone: "text-amber-400" },
  reminder: { icon: BellRing, label: "Reminder", tone: "text-violet-400" },
};

const DATE_FORMAT = "yyyy-MM-dd";

function parseDueDate(value: unknown): Date | undefined {
  if (typeof value !== "string" || value === "") return undefined;
  const parsed = parse(value, DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function NoteCalloutView({ node, updateAttributes, editor }: NodeViewProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const variant: CalloutVariant = isCalloutVariant(node.attrs.variant)
    ? node.attrs.variant
    : "warning";
  const dueDate = parseDueDate(node.attrs.dueDate);
  // Compared at day granularity: a reminder due today is still due, not overdue.
  const isOverdue = dueDate !== undefined && dueDate < startOfDay(new Date());

  const style = VARIANT_STYLE[variant];
  const Icon = style.icon;

  const cycleVariant = () => {
    const next = CALLOUT_VARIANTS[(CALLOUT_VARIANTS.indexOf(variant) + 1) % CALLOUT_VARIANTS.length];
    // Dropping the reminder variant drops its date too, so switching back doesn't
    // resurrect a due date the user thought they had removed.
    updateAttributes(next === "reminder" ? { variant: next } : { variant: next, dueDate: null });
  };

  return (
    <NodeViewWrapper
      data-type="callout"
      data-variant={variant}
      className="my-2 flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 px-4 py-3.5"
    >
      <button
        type="button"
        // contentEditable={false} keeps ProseMirror from treating the control as
        // document text — without it, typing near the icon edits the button.
        contentEditable={false}
        disabled={!editor.isEditable}
        onClick={cycleVariant}
        title={`${style.label} — click to change`}
        aria-label={`Callout type: ${style.label}. Click to change.`}
        className={cn("mt-0.5 shrink-0", style.tone, editor.isEditable && "cursor-pointer")}
      >
        <Icon className="h-4 w-4" />
      </button>

      <div className="flex-1">
        <NodeViewContent className="text-[13.5px] leading-relaxed text-foreground/85" />

        {variant === "reminder" && (
          <div contentEditable={false} className="mt-2 flex items-center gap-2">
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild disabled={!editor.isEditable}>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs",
                    isOverdue
                      ? "text-destructive"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  {dueDate ? `Due ${format(dueDate, "MMM d, yyyy")}` : "Set a due date"}
                  {isOverdue && <span className="font-medium">· overdue</span>}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    updateAttributes({ dueDate: date ? format(date, DATE_FORMAT) : null });
                    setPickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {dueDate && editor.isEditable && (
              <button
                type="button"
                onClick={() => updateAttributes({ dueDate: null })}
                title="Clear due date"
                aria-label="Clear due date"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
