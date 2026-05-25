import { CalendarDays, CalendarRange, RefreshCw, RotateCcw, Sparkles } from "lucide-react";
import type { DateFilter, QuickRangeKey } from "./dateRange";
import { quickRanges, getQuickDateRange, isSameRange } from "./dateRange";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DashboardFiltersBarProps = {
  draftRange: DateFilter;
  appliedRange: DateFilter;
  hasValidRange: boolean;
  hasRangeChanged: boolean;
  hasInvertedDates: boolean;
  appliedQuickRangeLabel: string | null;
  refreshing: boolean;
  onDraftChange: (next: DateFilter) => void;
  onApply: () => void;
  onReset: () => void;
  onRefresh: () => void;
  onApplyQuickRange: (key: QuickRangeKey) => void;
};

export function DashboardFiltersBar({
  draftRange,
  appliedRange,
  hasValidRange,
  hasRangeChanged,
  hasInvertedDates,
  appliedQuickRangeLabel,
  refreshing,
  onDraftChange,
  onApply,
  onReset,
  onRefresh,
  onApplyQuickRange,
}: DashboardFiltersBarProps) {
  return (
    <header className="rounded-2xl border border-border/60 bg-card/40 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">A clear pulse of your business in one place</p>
            </div>
          </div>
        </div>

        <Button
          onClick={onRefresh}
          disabled={refreshing}
          variant="default"
          className="h-9 gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh data"}
        </Button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-end">
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Quick ranges
          </p>
          <div className="flex h-10 items-center gap-1 rounded-lg border border-border/60 bg-background/40 p-1">
            {quickRanges.map((quickRange) => {
              const previewRange = getQuickDateRange(quickRange.key);
              const isActive = isSameRange(previewRange, draftRange);

              return (
                <Button
                  key={quickRange.key}
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="h-8 rounded-md px-3 text-xs"
                  onClick={() => onApplyQuickRange(quickRange.key)}
                >
                  {quickRange.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <CalendarRange className="h-3.5 w-3.5" />
            Custom range
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">From</label>
              <Input
                type="date"
                value={draftRange.from}
                max={draftRange.to || undefined}
                onChange={(event) => onDraftChange({ ...draftRange, from: event.target.value })}
                className="h-10 w-[160px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">To</label>
              <Input
                type="date"
                value={draftRange.to}
                min={draftRange.from || undefined}
                onChange={(event) => onDraftChange({ ...draftRange, to: event.target.value })}
                className="h-10 w-[160px]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <Button
            variant="default"
            className="h-10 px-4"
            disabled={!hasValidRange || !hasRangeChanged}
            onClick={onApply}
          >
            Apply
          </Button>
          <Button variant="ghost" className="h-10 gap-2 px-3" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {hasInvertedDates ? (
        <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Invalid range: "From" date must be before or equal to "To" date.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {appliedQuickRangeLabel ?? "Custom range"}
        </span>
        <span className="text-muted-foreground">
          Showing data from <span className="font-medium text-foreground">{appliedRange.from}</span> to{" "}
          <span className="font-medium text-foreground">{appliedRange.to}</span>
        </span>
      </div>
    </header>
  );
}
