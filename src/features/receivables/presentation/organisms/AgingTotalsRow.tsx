import type { AgingBucket, AgingBucketKey } from "../../domain/types";
import { AGING_BUCKET_ORDER } from "../../domain/types";
import { AGING_BUCKET_LABEL } from "../atoms/AgingBucketBadge";
import { AgingBucketCard } from "../molecules/AgingBucketCard";

type AgingTotalsRowProps = {
  totals: Record<AgingBucketKey, AgingBucket>;
  grandTotal: AgingBucket;
};

/**
 * Buckets stay in the report's own order (youngest to oldest, undated last) rather than
 * oldest-first like the table below: the row is read as a ladder, and reversing it would
 * put the ages in one direction here and the other one two inches further down.
 */
export function AgingTotalsRow({ totals, grandTotal }: AgingTotalsRowProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <AgingBucketCard label="Total outstanding" data={grandTotal} frame="total" />
      {AGING_BUCKET_ORDER.map((bucket) => (
        <AgingBucketCard
          key={bucket}
          label={AGING_BUCKET_LABEL[bucket]}
          data={totals[bucket]}
          frame={bucket === "unknown" ? "unknown" : undefined}
        />
      ))}
    </div>
  );
}
