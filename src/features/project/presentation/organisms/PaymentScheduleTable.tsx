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
  const mismatch =
    !overRemaining &&
    typeof estimatedAmount === "number" &&
    schedule.totalAmount != null &&
    Math.abs(schedule.totalAmount - estimatedAmount) > RECONCILIATION_TOLERANCE;

  return (
    <section className="rounded-md border border-border/70 bg-muted/20 p-3" aria-label="Payment Schedule">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">Payment Schedule</h3>
        <span className="max-w-[60%] truncate text-xs text-muted-foreground" title={schedule.source.fileName}>
          {schedule.source.fileName}
        </span>
      </div>

      <p className="mb-2 text-xs text-muted-foreground">
        {overRemaining
          ? "Los porcentajes se calculan sobre el saldo restante, no sobre el total del estimate."
          : "Los porcentajes se calculan sobre el total del cronograma."}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-2">Stage</th>
              <th className="p-2">Percentage</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {schedule.items.map((item, index) => (
              <tr key={`${item.label}-${index}`} className="border-b border-border/60">
                <td className="p-2">{item.label}</td>
                <td className="p-2 font-mono">
                  {item.percentage == null ? (
                    <span className="font-sans text-xs text-muted-foreground">Monto fijo</span>
                  ) : (
                    <>
                      {item.percentage}%
                      {item.basis === "remaining-balance" && (
                        <span className="ml-1 font-sans text-xs text-muted-foreground">del saldo</span>
                      )}
                    </>
                  )}
                </td>
                <td className="p-2 text-right font-mono">
                  {item.amount == null ? "—" : formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-medium">
              <td className="p-2">Total</td>
              <td className="p-2 font-mono">
                {schedule.totalPercentage == null ? "—" : `${schedule.totalPercentage}%`}
              </td>
              <td className="p-2 text-right font-mono">
                {schedule.totalAmount == null ? "—" : formatCurrency(schedule.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {mismatch && (
        <Notice>
          El cronograma suma {formatCurrency(schedule.totalAmount!)} y el estimate en QuickBooks es{" "}
          {formatCurrency(estimatedAmount!)}. El documento puede estar calculado sobre un saldo
          parcial o estar desactualizado.
        </Notice>
      )}

      {schedule.source.matchedBy === "file-name" && (
        <Notice>
          Este PDF se asoció al proyecto por el número en el nombre del archivo, no por estar
          adjunto a su estimate o factura. Verificá que corresponda.
        </Notice>
      )}
    </section>
  );
}
