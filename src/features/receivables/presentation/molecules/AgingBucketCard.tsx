import { AlertTriangle } from "lucide-react";
import type { AgingBucket } from "../../domain/types";
import { money } from "../atoms/money";

type AgingBucketCardProps = {
  label: string;
  data: AgingBucket;
  /** `unknown` gets the dashed frame of missing data; `total` the heavier one of a summary. */
  frame?: "unknown" | "total";
};

/**
 * One tile of the aging row.
 *
 * The whole point of the tile is that its amount is a floor, not a total: a project nobody
 * invoiced yet adds 0 to `outstandingAmount`, so a tile showing only money invites a
 * decision based on a number that is knowably too low. The unbilled count therefore sits
 * next to the figure in the tile itself — not behind a tooltip — and the figure wears an
 * explicit "at least" whenever it is incomplete.
 */
export function AgingBucketCard({ label, data, frame }: AgingBucketCardProps) {
  const hasUnbilled = data.unbilledProjectCount > 0;

  const frameClasses =
    frame === "total"
      ? "border-line-strong bg-elev-3"
      : frame === "unknown"
        ? "border-dashed border-violet-500/40 bg-elev-2"
        : "border-line bg-elev-2";

  return (
    <div className={`rounded-xl border p-3 ${frameClasses}`} role="group" aria-label={label}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
        {hasUnbilled && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-amber-300">
            at least
          </span>
        )}
        <span className="font-mono text-xl font-semibold tabular-nums">
          {money(data.outstandingAmount)}
        </span>
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {data.projectCount} {data.projectCount === 1 ? "project" : "projects"}
      </p>

      {hasUnbilled && (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-300">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            + {data.unbilledProjectCount} with no invoice recorded
          </span>
        </p>
      )}
    </div>
  );
}
