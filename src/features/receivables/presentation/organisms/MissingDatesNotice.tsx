import { CalendarOff } from "lucide-react";
import type { AgingBucket } from "../../domain/types";

/**
 * On day one most rows land in `unknown`, because `end_date` is recorded almost nowhere.
 * Left unexplained that looks like a portfolio with nothing overdue, which is the exact
 * opposite of the truth, so the gap is stated as the finding it is — and as the one action
 * that makes the rest of the screen work.
 */
export function MissingDatesNotice({
  unknown,
  projectTotal,
}: {
  unknown: AgingBucket;
  projectTotal: number;
}) {
  if (unknown.projectCount === 0) return null;

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-violet-500/40 bg-violet-500/5 p-3">
      <CalendarOff className="mt-0.5 size-4 shrink-0 text-violet-300" aria-hidden="true" />
      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">
          {unknown.projectCount} of {projectTotal} projects cannot be aged yet
        </p>
        <p className="text-xs text-muted-foreground">
          They have neither a completion date nor an invoice date on record, so their age is
          unknown — which is not the same as up to date. Fill in the end date or the invoice
          date on the project and the debt starts aging here.
        </p>
      </div>
    </div>
  );
}
