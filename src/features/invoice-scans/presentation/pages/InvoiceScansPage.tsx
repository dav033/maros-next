"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Camera, FileText, Plus } from "lucide-react";
import { PageHeaderCard } from "@/components/shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvoiceScan } from "../../domain/models";
import { listInvoiceScans } from "../../infra/invoiceScansApi";

const CLASSIFICATION_LABELS: Record<string, string> = {
  customer_service: "Customer service",
  materials_expense: "Materials",
  subcontractor_expense: "Subcontractor",
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

export function InvoiceScansPage() {
  const [scans, setScans] = useState<InvoiceScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setScans(await listInvoiceScans());
    } catch {
      setError(
        "Invoice scans could not be loaded. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <PageHeaderCard
        icon={FileText}
        title="Invoice scans"
        description="Scanned photos, extracted details, and QuickBooks suggestions."
        rightSlot={
          <Button asChild>
            <Link href="/finance/invoices/scan">
              <Plus aria-hidden="true" />
              Scan invoice
            </Link>
          </Button>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void load()}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <section
        aria-label="Scanned invoices"
        className="rounded-xl border bg-card"
      >
        {loading ? (
          <div
            className="divide-y"
            role="status"
            aria-label="Loading invoice scans"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-4 py-5 sm:px-6"
              >
                <span className="h-4 w-40 max-w-[30%] animate-pulse rounded bg-muted" />
                <span className="hidden h-4 w-36 animate-pulse rounded bg-muted sm:block" />
                <span className="ml-auto h-5 w-24 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : scans.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl border border-border bg-background text-primary">
              <Camera className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              No invoice photos yet
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Take or choose a photo to get started. The scan runs
              automatically, and the extracted details and QuickBooks
              suggestions will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Scanned
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scans.map((scan) => {
                    const invoice = scan.extractedData;
                    return (
                      <TableRow key={scan.id}>
                        <TableCell className="max-w-44">
                          <Link
                            href={`/finance/invoices/${scan.id}`}
                            className="block truncate font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {invoice?.invoiceNumber || scan.fileName}
                          </Link>
                          <span className="block truncate text-xs text-muted-foreground">
                            {invoice?.direction === "incoming"
                              ? "Supplier bill"
                              : invoice?.direction === "outgoing"
                                ? "Customer invoice"
                                : "Invoice photo"}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-48 truncate">
                          {invoice?.counterpartyName || "Not identified"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {invoice
                            ? CLASSIFICATION_LABELS[invoice.classification]
                            : "—"}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatMoney(
                            invoice?.total ?? null,
                            invoice?.currency ?? null,
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              scan.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                            className="font-medium"
                          >
                            {STATUS_LABELS[scan.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y md:hidden">
              {scans.map((scan) => {
                const invoice = scan.extractedData;
                const direction =
                  invoice?.direction === "incoming"
                    ? "Supplier bill"
                    : invoice?.direction === "outgoing"
                      ? "Customer invoice"
                      : "Invoice photo";

                return (
                  <Link
                    key={scan.id}
                    href={`/finance/invoices/${scan.id}`}
                    className="block space-y-3 p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {invoice?.invoiceNumber || scan.fileName}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {direction}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="mt-0.5 font-semibold tabular-nums">
                          {formatMoney(
                            invoice?.total ?? null,
                            invoice?.currency ?? null,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-sm text-muted-foreground">
                        {invoice?.counterpartyName || "Company not identified"}
                      </p>
                      <Badge
                        variant={
                          scan.status === "failed" ? "destructive" : "secondary"
                        }
                        className="shrink-0 font-medium"
                      >
                        {STATUS_LABELS[scan.status]}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span className="truncate">
                        {invoice
                          ? CLASSIFICATION_LABELS[invoice.classification]
                          : "Category not identified"}
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
