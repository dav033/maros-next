/** Mirrors GET /projects/receivables. Dates are "YYYY-MM-DD", never timestamps. */

export type AgingBucketKey = "current" | "31_60" | "61_90" | "over_90" | "unknown";

export type AgingBucket = {
  projectCount: number;
  /**
   * A floor, not a total: projects with no invoice recorded contribute 0 here and
   * are counted in `unbilledProjectCount` instead. Never render one without the other.
   */
  outstandingAmount: number;
  unbilledProjectCount: number;
};

export type ReceivableProject = {
  id: number;
  leadNumber: string | null;
  name: string | null;
  /** null = nobody recorded an invoice. Not the same as an invoice for zero. */
  billedAmount: number | null;
  /** null = nothing recorded. Not the same as "collected nothing". */
  collectedAmount: number | null;
  outstandingAmount: number | null;
  billedAt: string | null;
  endDate: string | null;
  /** null = neither date exists, so the age is unknown — not zero. */
  daysOutstanding: number | null;
  agingBucket: AgingBucketKey;
};

export type ReceivablesReport = {
  asOf: string;
  /** Already sorted by the backend: oldest debt first, undated rows last. */
  projects: ReceivableProject[];
  totals: Record<AgingBucketKey, AgingBucket>;
  grandTotal: AgingBucket;
};

export const AGING_BUCKET_ORDER: AgingBucketKey[] = [
  "current",
  "31_60",
  "61_90",
  "over_90",
  "unknown",
];
