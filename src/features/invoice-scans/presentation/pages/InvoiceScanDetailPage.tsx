"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  FileText,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppError } from "@/shared/errors";
import {
  getInvoiceScan,
  retryInvoiceScan,
  updateInvoiceScanProjectNumber,
} from "../../infra/invoiceScansApi";
import type { InvoiceScan } from "../../domain/models";

const CLASSIFICATION_LABELS: Record<string, string> = {
  customer_service: "Customer service",
  materials_expense: "Materials expense",
  subcontractor_expense: "Subcontractor expense",
  other: "Other",
  unknown: "Unclassified",
};

const STATUS_LABELS: Record<InvoiceScan["status"], string> = {
  uploaded: "Awaiting scan",
  processing: "Scanning",
  needs_review: "Ready to review",
  failed: "Scan failed",
};

function formatMoney(amount: number | null, currency: string | null) {
  if (amount === null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || ""}`.trim();
  }
}

function DetailField({
  label,
  value,
  prominent = false,
}: {
  label: string;
  value: string | number | null | undefined;
  prominent?: boolean;
}) {
  return (
    <div className="min-w-0 border-b py-3 last:border-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className={`mt-1 break-words tabular-nums ${prominent ? "text-lg font-semibold" : "text-sm font-medium"}`}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

export function InvoiceScanDetailPage({ id }: { id: string }) {
  const [scan, setScan] = useState<InvoiceScan | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectNumber, setProjectNumber] = useState("");
  const [savingProject, setSavingProject] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const loaded = await getInvoiceScan(id);
      setScan(loaded);
      setProjectNumber(loaded.projectNumber ?? "");
    } catch {
      setError("This invoice scan could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function retry() {
    setRetrying(true);
    setError(null);
    try {
      setScan(await retryInvoiceScan(id));
    } catch {
      setError(
        "The photo could not be scanned. Check the image and server connection, then try again.",
      );
      await load();
    } finally {
      setRetrying(false);
    }
  }

  async function saveProjectNumber() {
    setSavingProject(true);
    setProjectError(null);
    try {
      const updated = await updateInvoiceScanProjectNumber(
        id,
        projectNumber.trim() || null,
      );
      setScan((current) => (current ? { ...updated, imageUrl: current.imageUrl } : updated));
      setProjectNumber(updated.projectNumber ?? "");
    } catch (err) {
      setProjectError(
        err instanceof AppError && err.status === 400
          ? "No project found with that number."
          : "The project number could not be saved. Try again.",
      );
    } finally {
      setSavingProject(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading invoice">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.85fr)]">
          <div className="min-h-80 animate-pulse rounded-xl border bg-card" />
          <div className="min-h-56 animate-pulse rounded-xl border bg-card" />
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex w-full flex-1 flex-col gap-4">
        <Link
          href="/finance/invoices"
          className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All invoice scans
        </Link>
        {error && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  const invoice = scan.extractedData;
  const suggestions = scan.qboSuggestions;
  const canRetry = scan.status === "uploaded" || scan.status === "failed";

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <Link
        href="/finance/invoices"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All invoice scans
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            {invoice?.invoiceNumber
              ? `Invoice ${invoice.invoiceNumber}`
              : scan.fileName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {invoice?.counterpartyName || "Company not identified"} ·{" "}
            {invoice
              ? CLASSIFICATION_LABELS[invoice.classification]
              : "Scan details"}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Badge
            variant={scan.status === "failed" ? "destructive" : "secondary"}
            className="font-medium"
          >
            {STATUS_LABELS[scan.status]}
          </Badge>
          {canRetry && (
            <Button
              type="button"
              size="sm"
              onClick={() => void retry()}
              disabled={retrying}
            >
              {retrying ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <RotateCcw aria-hidden="true" />
              )}
              {retrying ? "Scanning…" : "Scan photo"}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void saveProjectNumber();
        }}
      >
        <div className="space-y-1">
          <label
            htmlFor="invoice-project-number"
            className="text-xs font-medium text-muted-foreground"
          >
            Project number
          </label>
          <Input
            id="invoice-project-number"
            value={projectNumber}
            onChange={(event) => setProjectNumber(event.target.value)}
            placeholder="e.g. 074P-0926"
            maxLength={50}
            className="w-48"
            aria-invalid={projectError ? true : undefined}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={
            savingProject || projectNumber.trim() === (scan.projectNumber ?? "")
          }
        >
          {savingProject && (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          )}
          Save
        </Button>
        {projectError && (
          <p className="w-full text-sm text-destructive" role="alert">
            {projectError}
          </p>
        )}
      </form>

      {scan.errorMessage && scan.status === "failed" && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{scan.errorMessage}</AlertDescription>
        </Alert>
      )}

      {invoice ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.85fr)]">
          <section
            className="min-w-0 rounded-xl border bg-card p-4 sm:p-6"
            aria-labelledby="extracted-title"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="extracted-title" className="text-lg font-semibold">
                  Extracted details
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check the values against the original photo before using them.
                </p>
              </div>
              <Badge
                variant="outline"
                className="font-medium text-muted-foreground"
              >
                Extraction confidence {Math.round(invoice.confidence * 100)}%
              </Badge>
            </div>

            <dl className="mt-3 grid gap-x-6 sm:grid-cols-2">
              <DetailField
                label="Company / customer"
                value={invoice.counterpartyName}
              />
              <DetailField
                label="Document type"
                value={
                  invoice.direction === "incoming"
                    ? "Supplier bill"
                    : invoice.direction === "outgoing"
                      ? "Customer invoice"
                      : "Unknown"
                }
              />
              <DetailField
                label="Invoice number"
                value={invoice.invoiceNumber}
              />
              <DetailField
                label="Category"
                value={CLASSIFICATION_LABELS[invoice.classification]}
              />
              <DetailField label="Issue date" value={invoice.issueDate} />
              <DetailField label="Due date" value={invoice.dueDate} />
              <DetailField
                label="Payment status"
                value={invoice.paymentStatus}
              />
            </dl>

            <div className="mt-5 border-t pt-4">
              <h3 className="font-semibold">Line items</h3>
              {invoice.lineItems.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No line items could be read from this photo.
                </p>
              ) : (
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[28rem] text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="py-2 pr-3 font-medium">Description</th>
                        <th className="px-3 py-2 text-right font-medium">
                          Qty
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Unit price
                        </th>
                        <th className="py-2 pl-3 text-right font-medium">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((line, index) => (
                        <tr
                          key={`${line.description}-${index}`}
                          className="border-b last:border-0"
                        >
                          <td className="max-w-64 py-2 pr-3">
                            {line.description || "—"}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {line.quantity ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {formatMoney(line.unitPrice, invoice.currency)}
                          </td>
                          <td className="py-2 pl-3 text-right tabular-nums">
                            {formatMoney(line.amount, invoice.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <dl className="mt-4 ml-auto max-w-sm rounded-lg bg-muted/60 px-4 py-1">
              <DetailField
                label="Subtotal"
                value={formatMoney(invoice.subtotal, invoice.currency)}
              />
              <DetailField
                label="Tax"
                value={formatMoney(invoice.taxTotal, invoice.currency)}
              />
              <DetailField
                label="Invoice total"
                value={formatMoney(invoice.total, invoice.currency)}
                prominent
              />
            </dl>
          </section>

          <div className="flex min-w-0 flex-col gap-4">
            {scan.imageUrl && (
              <figure className="overflow-hidden rounded-xl border bg-card">
                {scan.contentType === "application/pdf" ? (
                  <div className="grid aspect-[4/3] place-items-center bg-background px-6 text-center">
                    <div className="flex flex-col items-center">
                      <FileText
                        className="h-10 w-10 text-primary"
                        aria-hidden="true"
                      />
                      <p className="mt-3 font-medium">PDF invoice</p>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-4"
                      >
                        <a
                          href={scan.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink aria-hidden="true" />
                          Open PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] bg-background">
                    <Image
                      src={scan.imageUrl}
                      alt="Original invoice photo"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                )}
                <figcaption className="truncate border-t px-4 py-3 text-xs text-muted-foreground">
                  Original invoice · {scan.fileName}
                </figcaption>
              </figure>
            )}

            <section
              className="rounded-xl border bg-card p-4 sm:p-6"
              aria-labelledby="qbo-title"
            >
              <h2 id="qbo-title" className="text-lg font-semibold">
                QuickBooks suggestions
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Matches are suggestions only. Nothing is created or changed in
                QuickBooks.
              </p>
              {suggestions.connected === false ? (
                <p className="mt-4 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  QuickBooks is not connected. The invoice details are saved;
                  matches can be checked after it reconnects.
                </p>
              ) : (
                <div className="mt-4 space-y-4 text-sm">
                  <p>
                    Suggested record:{" "}
                    <span className="font-semibold">
                      {suggestions.transactionType || "Needs review"}
                    </span>
                  </p>
                  {suggestions.counterparties?.length ? (
                    <div>
                      <h3 className="font-medium">
                        {suggestions.counterpartyType} matches
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {suggestions.counterparties.map((candidate) => (
                          <li
                            key={candidate.id}
                            className="flex items-center justify-between gap-3 rounded-md bg-muted/70 px-3 py-2"
                          >
                            <span className="min-w-0 truncate">
                              {candidate.name}
                            </span>
                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                              {candidate.confidence}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No confident customer or supplier match found.
                    </p>
                  )}
                  {suggestions.expenseAccounts?.length ? (
                    <div>
                      <h3 className="font-medium">Expense accounts</h3>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        {suggestions.expenseAccounts.map((account) => (
                          <li key={account.id}>{account.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {suggestions.serviceItems?.length ? (
                    <div>
                      <h3 className="font-medium">Service items</h3>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        {suggestions.serviceItems.map((item) => (
                          <li key={item.id}>{item.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : scan.status === "processing" ? (
        <div className="flex min-h-48 items-center justify-center gap-2 rounded-xl border bg-card text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />{" "}
          Scanning invoice…
        </div>
      ) : (
        <section
          className="rounded-xl border bg-card px-5 py-8 sm:px-8"
          aria-live="polite"
        >
          <h2 className="font-semibold">
            Invoice details aren’t available yet
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {scan.status === "failed"
              ? "Review the original photo and try the scan again."
              : "Scan the saved photo to extract invoice details and find possible QuickBooks matches."}
          </p>
        </section>
      )}
    </div>
  );
}
