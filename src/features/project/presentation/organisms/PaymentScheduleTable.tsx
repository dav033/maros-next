import type { ProjectPaymentSchedule } from "@/project/domain";
import { formatCurrency } from "@/shared/utils";

export function PaymentScheduleTable({ schedule }: { schedule: ProjectPaymentSchedule }) {
  return (
    <section className="rounded-md border border-border/70 bg-muted/20 p-3" aria-label="Payment Schedule">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">Payment Schedule</h3>
        <span className="max-w-[60%] truncate text-xs text-muted-foreground">{schedule.source.fileName}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground"><th className="p-2">Stage</th><th className="p-2">Percentage</th><th className="p-2 text-right">Amount</th></tr></thead>
          <tbody>{schedule.items.map((item) => <tr key={`${item.label}-${item.percentage}`} className="border-b border-border/60"><td className="p-2">{item.label}</td><td className="p-2 font-mono">{item.percentage}%</td><td className="p-2 text-right font-mono">{item.amount == null ? "—" : formatCurrency(item.amount)}</td></tr>)}</tbody>
          <tfoot><tr className="font-medium"><td className="p-2">Total</td><td className="p-2 font-mono">{schedule.totalPercentage == null ? "—" : `${schedule.totalPercentage}%`}</td><td className="p-2 text-right font-mono">{schedule.totalAmount == null ? "—" : formatCurrency(schedule.totalAmount)}</td></tr></tfoot>
        </table>
      </div>
    </section>
  );
}
