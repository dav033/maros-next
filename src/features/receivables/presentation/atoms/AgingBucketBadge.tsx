import { CalendarOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AgingBucketKey } from "../../domain/types";

export const AGING_BUCKET_LABEL: Record<AgingBucketKey, string> = {
  current: "0–30 days",
  "31_60": "31–60 days",
  "61_90": "61–90 days",
  over_90: "Over 90 days",
  unknown: "No dates recorded",
};

const SHORT_LABEL: Record<AgingBucketKey, string> = {
  current: "0–30",
  "31_60": "31–60",
  "61_90": "61–90",
  over_90: "90+",
  unknown: "No dates",
};

/**
 * Escalating warmth for the real ages, and a dashed violet for `unknown` — anything on the
 * green end would let a row with no completion date pass for a debt that is up to date.
 */
const AGING_BUCKET_STYLE: Record<AgingBucketKey, string> = {
  current: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "31_60": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "61_90": "bg-orange-500/15 text-orange-300 border-orange-500/30",
  over_90: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  unknown: "border-dashed bg-violet-500/15 text-violet-300 border-violet-500/40",
};

export function AgingBucketBadge({ bucket }: { bucket: AgingBucketKey }) {
  return (
    <Badge className={`gap-1 font-display uppercase tracking-wide ${AGING_BUCKET_STYLE[bucket]}`}>
      {bucket === "unknown" && <CalendarOff className="size-3" aria-hidden="true" />}
      {SHORT_LABEL[bucket]}
    </Badge>
  );
}
