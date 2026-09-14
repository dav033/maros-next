import { AlertTriangle } from "lucide-react";

import type { ProjectPaymentSchedule } from "@/project/domain";
import { formatCurrency } from "@/shared/utils";

/** Un céntimo arriba o abajo es redondeo del PDF, no un descuadre real. */
const RECONCILIATION_TOLERANCE = 1;

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-300">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function PaymentScheduleTable({
  schedule,
  estimatedAmount,
}: {
  schedule: ProjectPaymentSchedule;
  /** Total del estimate en QuickBooks, para avisar si el cronograma no cuadra. */
  estimatedAmount?: number;
}) {
  const overRemaining = schedule.basis === "remaining-balance";
  const amountBasis =
    typeof estimatedAmount === "number" && estimatedAmount > 0
      ? estimatedAmount
      : schedule.totalAmount;
  let cumulativePercentage: number | null = 0;
  const rows = schedule.items.map((item, index) => {
    const itemBasis = item.basis ?? schedule.basis;
    if (item.amount != null && amountBasis != null && amountBasis > 0) {
      if (cumulativePercentage !== null) {
        cumulativePercentage += (item.amount / amountBasis) * 100;
      }
    } else if (item.percentage != null) {
      if (cumulativePercentage !== null) {
        cumulativePercentage =
          itemBasis === "remaining-balance"
            ? cumulativePercentage +
              ((100 - cumulativePercentage) * item.percentage) / 100
            : cumulativePercentage + item.percentage;
      }
    } else {
      cumulativePercentage = null;
    }
    return { item, index, cumulativePercentage };
  });
  const cumulativeTotal = rows.at(-1)?.cumulativePercentage ?? null;
  const mismatch =
    !overRemaining &&
    typeof estimatedAmount === "number" &&
    schedule.totalAmount != null &&
    Math.abs(schedule.totalAmount - estimatedAmount) > RECONCILIATION_TOLERANCE;

  return (
    <section
      className="rounded-md border border-border/70 bg-muted/20 p-3"
      aria-label="Payment Schedule"
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">Payment Schedule</h3>
        <span
          className="max-w-[60%] truncate text-xs text-muted-foreground"
          title={schedule.source.fileName}
        >
          {schedule.source.fileName}
        </span>
      </div>

      <p className="mb-2 text-xs text-muted-foreground">
        {overRemaining
          ? "Los porcentajes se calculan sobre el saldo restante, no sobre el total del estimate."
          : "Los porcentajes se calculan sobre el total del cronograma."}
      </p>

      <div className="space-y-2 md:hidden">
        {rows.map(({ item, index, cumulativePercentage }) => (
          <article
            key={`${item.label}-${index}`}
            className="rounded-md border border-border/60 bg-background/40 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="min-w-0 break-words text-sm font-medium">{item.label}</h4>
              <span className="shrink-0 font-mono text-sm font-medium tabular-nums">
                {item.amount == null ? "—" : formatCurrency(item.amount)}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border/50 pt-2 text-xs">
              <div className="min-w-0">
                <dt className="text-muted-foreground">Percentage</dt>
                <dd className="mt-0.5 font-mono tabular-nums">
                  {item.percentage == null ? "Fixed amount" : `${Number(item.percentage.toFixed(2))}%`}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground">Cumulative</dt>
                <dd className="mt-0.5 font-mono tabular-nums">
                  {cumulativePercentage === null
                    ? "—"
                    : `${Number(cumulativePercentage.toFixed(2))}%`}
                </dd>
              </div>
            </dl>
        </article>
      ))}
        <div className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-3 py-2 text-sm font-medium">
          <div>
            <p>Total</p>
            <p className="text-[10px] font-normal text-muted-foreground">
              {cumulativeTotal === null
                ? "Cumulative —"
                : `${Number(cumulativeTotal.toFixed(2))}% cumulative`}
            </p>
          </div>
          <span className="font-mono tabular-nums">
            {schedule.totalAmount == null ? "—" : formatCurrency(schedule.totalAmount)}
          </span>
        </div>
      </div>

      <div
        role="region"
        aria-label="Payment schedule table"
        tabIndex={0}
        className="hidden overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:block"
      >
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-2">Stage</th>
              <th className="p-2 text-right">Percentage</th>
              <th className="p-2 text-right">Cumulative %</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, index, cumulativePercentage }) => (
              <tr
                key={`${item.label}-${index}`}
                className="border-b border-border/60"
              >
                <td className="p-2">{item.label}</td>
                <td className="p-2 text-right font-mono tabular-nums">
                  {item.percentage == null ? (
                    <span className="font-sans text-xs text-muted-foreground">
                      Fixed amount
                    </span>
                  ) : (
                    `${Number(item.percentage.toFixed(2))}%`
                  )}
                </td>
                <td className="p-2 text-right font-mono tabular-nums">
                  {cumulativePercentage === null
                    ? "—"
                    : `${Number(cumulativePercentage.toFixed(2))}%`}
                </td>
                <td className="p-2 text-right font-mono tabular-nums">
                  {item.amount == null ? "—" : formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-medium">
              <td className="p-2">Total</td>
              <td className="p-2 text-right font-mono tabular-nums">
                {overRemaining || schedule.totalPercentage == null
                  ? "—"
                  : `${schedule.totalPercentage}%`}
              </td>
              <td className="p-2 text-right font-mono tabular-nums">
                {cumulativeTotal === null
                  ? "—"
                  : `${Number(cumulativeTotal.toFixed(2))}%`}
              </td>
              <td className="p-2 text-right font-mono">
                {schedule.totalAmount == null
                  ? "—"
                  : formatCurrency(schedule.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {mismatch && (
        <Notice>
          El cronograma suma {formatCurrency(schedule.totalAmount!)} y el
          estimate en QuickBooks es {formatCurrency(estimatedAmount!)}. El
          documento puede estar calculado sobre un saldo parcial o estar
          desactualizado.
        </Notice>
      )}

      {schedule.source.matchedBy === "file-name" && (
        <Notice>
          Este PDF se asoció al proyecto por el número en el nombre del archivo,
          no por estar adjunto a su estimate o factura. Verificá que
          corresponda.
        </Notice>
      )}
    </section>
  );
}
