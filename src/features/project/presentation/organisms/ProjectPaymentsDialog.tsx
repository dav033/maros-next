"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/shared/utils";
import type { Project, ProjectPaymentsResponse } from "@/project/domain";
import { ProjectHttpRepository } from "../../infra/http/ProjectHttpRepository";
import { PaymentScheduleTable } from "./PaymentScheduleTable";

const repository = new ProjectHttpRepository();

export function ProjectPaymentsDialog({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const query = useQuery({
    queryKey: ["project-payments", project?.id],
    queryFn: () => repository.getPaymentDetails(project!.id),
    enabled: project != null,
  });

  return (
    <Dialog
      open={project != null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] w-[calc(100vw-1rem)] max-w-6xl overflow-y-auto p-4 sm:w-[calc(100vw-2rem)] sm:p-6">
        <DialogHeader>
          <DialogTitle className="break-words pr-8">
            Payments · {project?.lead.leadNumber ?? `Project #${project?.id}`}
          </DialogTitle>
        </DialogHeader>
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading payment receipts…
          </p>
        ) : null}
        {query.error ? (
          <p className="text-sm text-destructive">
            Could not load QuickBooks payments.
          </p>
        ) : null}
        {project?.financial?.paymentSchedule ? (
          <PaymentScheduleTable
            schedule={project.financial.paymentSchedule}
            estimatedAmount={project.financial.estimatedAmount}
          />
        ) : null}
        {query.data ? (
          <PaymentContent
            data={query.data}
            estimatedAmount={project?.financial?.estimatedAmount}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatPaymentDate(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}

function PaymentContent({
  data,
  estimatedAmount,
}: {
  data: ProjectPaymentsResponse;
  estimatedAmount?: number;
}) {
  const hasEstimate =
    typeof estimatedAmount === "number" && estimatedAmount > 0;
  const pending = hasEstimate
    ? Math.max(0, estimatedAmount - data.totalAmount)
    : null;
  const percentComplete = hasEstimate
    ? (data.totalAmount / estimatedAmount) * 100
    : null;
  const payments = [...data.items].sort((a, b) =>
    (a.date ?? "").localeCompare(b.date ?? ""),
  );

  return (
    <section className="space-y-4" aria-label="Project payment activity">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">Payment activity</h3>
        <span className="text-xs text-muted-foreground">
          {data.count} {data.count === 1 ? "payment" : "payments"}
        </span>
      </div>

      {payments.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">No payments yet.</p>
      ) : (
        <>
        <div className="space-y-2 md:hidden">
          {payments.map((item, index) => {
            const invoiceAmount = item.linkedInvoices.reduce(
              (sum, invoice) => sum + (invoice.amount ?? 0),
              0,
            );
            const hasInvoiceAmounts =
              item.linkedInvoices.length > 0 &&
              item.linkedInvoices.every((invoice) => invoice.amount !== null);
            const invoiceNumbers = item.linkedInvoices
              .map((invoice) => invoice.documentNumber)
              .filter((number): number is string => Boolean(number))
              .join(", ");
            const paymentPercentage = hasEstimate
              ? (item.amount / estimatedAmount) * 100
              : null;
            const process = item.memo?.trim() || `Payment ${index + 1}`;
            const paymentDetails = [
              item.method,
              item.reference ? `Ref. ${item.reference}` : null,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <article
                key={item.id}
                className="rounded-md border border-border/60 bg-background/40 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-start gap-2">
                      <h4 className="min-w-0 break-words text-sm font-medium">{process}</h4>
                      {item.warnings.length > 0 ? (
                        <span
                          role="img"
                          aria-label={item.warnings.join(". ")}
                          title={item.warnings.join(". ")}
                          className="shrink-0 text-amber-300"
                        >
                          <AlertTriangle className="size-3.5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatPaymentDate(item.date)}
                      {paymentDetails ? ` · ${paymentDetails}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-semibold tabular-nums">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Payment</p>
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border/50 pt-2 text-xs">
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">Invoice</dt>
                    <dd className="mt-0.5 break-words font-mono tabular-nums">
                      {hasInvoiceAmounts ? formatCurrency(invoiceAmount) : "—"}
                    </dd>
                    {invoiceNumbers ? (
                      <dd className="mt-0.5 break-words text-[10px] text-muted-foreground">
                        {invoiceNumbers}
                      </dd>
                    ) : null}
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Percentage</dt>
                    <dd className="mt-0.5 font-mono tabular-nums">
                      {paymentPercentage === null
                        ? "—"
                        : formatPercentage(paymentPercentage)}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
        <div
          role="region"
          aria-label="Payment activity table"
          tabIndex={0}
          className="hidden overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:block"
        >
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="min-w-[220px] p-2">Process</th>
                <th className="p-2 text-right">Percentage</th>
                <th className="p-2 text-right">Invoice</th>
                <th className="p-2 text-right">Payment</th>
                <th className="min-w-[120px] p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((item, index) => {
                const invoiceAmount = item.linkedInvoices.reduce(
                  (sum, invoice) => sum + (invoice.amount ?? 0),
                  0,
                );
                const hasInvoiceAmounts =
                  item.linkedInvoices.length > 0 &&
                  item.linkedInvoices.every(
                    (invoice) => invoice.amount !== null,
                  );
                const invoiceNumbers = item.linkedInvoices
                  .map((invoice) => invoice.documentNumber)
                  .filter((number): number is string => Boolean(number))
                  .join(", ");
                const paymentPercentage = hasEstimate
                  ? (item.amount / estimatedAmount) * 100
                  : null;
                const process = item.memo?.trim() || `Payment ${index + 1}`;
                const paymentDetails = [
                  item.method,
                  item.reference ? `Ref. ${item.reference}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border/60 align-top"
                  >
                    <td className="p-2">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <div className="font-medium">{process}</div>
                          {paymentDetails ? (
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {paymentDetails}
                            </div>
                          ) : null}
                        </div>
                        {item.warnings.length > 0 ? (
                          <span
                            role="img"
                            aria-label={item.warnings.join(". ")}
                            title={item.warnings.join(". ")}
                            className="shrink-0 text-amber-300"
                          >
                            <AlertTriangle
                              className="size-3.5"
                              aria-hidden="true"
                            />
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-2 text-right font-mono tabular-nums">
                      {paymentPercentage === null
                        ? "—"
                        : formatPercentage(paymentPercentage)}
                    </td>
                    <td
                      className="p-2 text-right font-mono tabular-nums"
                      title={invoiceNumbers || undefined}
                    >
                      <div>
                        {hasInvoiceAmounts
                          ? formatCurrency(invoiceAmount)
                          : "—"}
                      </div>
                      {invoiceNumbers ? (
                        <div className="mt-0.5 font-sans text-xs text-muted-foreground">
                          {invoiceNumbers}
                        </div>
                      ) : null}
                    </td>
                    <td className="p-2 text-right font-mono tabular-nums">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="whitespace-nowrap p-2">
                      {formatPaymentDate(item.date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}

      <dl className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="min-w-0 py-3 sm:pr-3">
          <dt className="text-xs text-muted-foreground">Total Paid</dt>
          <dd className="mt-1 font-mono text-sm font-semibold tabular-nums">
            {formatCurrency(data.totalAmount)}
          </dd>
        </div>
        <div className="min-w-0 py-3 sm:px-3">
          <dt className="text-xs text-muted-foreground">Pending</dt>
          <dd className="mt-1 font-mono text-sm font-semibold tabular-nums">
            {pending === null ? "—" : formatCurrency(pending)}
          </dd>
        </div>
        <div className="min-w-0 py-3 sm:pl-3">
          <dt className="text-xs text-muted-foreground">% Complete</dt>
          <dd className="mt-1 font-mono text-sm font-semibold tabular-nums">
            {percentComplete === null ? "—" : formatPercentage(percentComplete)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
