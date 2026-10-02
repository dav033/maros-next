import { CalendarOff } from "lucide-react";
import { money } from "../widgets/formatters";
import type { StaleLeadsSummary as Summary } from "./useStaleLeads";

/**
 * Rendered from a fixed list rather than from the response order so an empty
 * bucket still takes up space: a gap at 180-364 is information, and a grid that
 * silently drops it makes a rotting pipeline look like a short one.
 */
const BUCKET_ORDER = ["0-29", "30-59", "60-89", "90-179", "180-364", "365+"] as const;

export function StaleLeadsSummary({ summary, days }: { summary: Summary; days: number }) {
  const byBucket = new Map(summary.buckets.map((bucket) => [bucket.bucket, bucket]));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-mono text-2xl font-semibold tabular-nums">{summary.totalCount}</p>
        <p className="text-sm text-muted-foreground">
          leads untouched for more than {days} days, worth{" "}
          <span className="font-mono tabular-nums text-foreground">
            {money.format(summary.totalEstimate)}
          </span>
        </p>
      </div>

      <ul
        aria-label="Age buckets"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        {BUCKET_ORDER.map((bucket) => {
          const entry = byBucket.get(bucket);
          const count = entry?.count ?? 0;
          const estimate = entry?.estimate ?? 0;

          return (
            <li
              key={bucket}
              className={`rounded-lg border border-line bg-elev-3 px-3 py-2 ${
                count === 0 ? "opacity-60" : ""
              }`}
            >
              <p className="font-display text-[11px] uppercase tracking-wide text-muted-foreground">
                {bucket} days
              </p>
              <p className="font-mono text-lg font-semibold tabular-nums">{count}</p>
              <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {money.format(estimate)}
              </p>
            </li>
          );
        })}
      </ul>

      {/* Outside the grid on purpose: these leads are not in any bucket and not in
          the table, because without a start date there is no age to measure. Folded
          into the totals they would simply stop existing. */}
      <section
        aria-label="Leads with no start date"
        className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-dashed border-line-strong bg-elev-2 px-3 py-2"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <CalendarOff className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="font-display text-[11px] uppercase tracking-wide text-muted-foreground">
            No start date
          </p>
          <p className="font-mono text-lg font-semibold tabular-nums">
            {summary.undatedCount}
            <span className="ml-2 font-sans text-[11px] font-normal text-muted-foreground">
              {money.format(summary.undatedEstimate)}
            </span>
          </p>
        </div>
        <p className="max-w-md text-xs text-muted-foreground">
          Undecided leads with no start date. They are counted separately from the buckets
          and the totals above, and they cannot be aged at all.
        </p>
      </section>
    </div>
  );
}
