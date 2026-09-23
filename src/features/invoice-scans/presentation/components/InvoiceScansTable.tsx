"use client";

import { TriangleAlert } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  CLASSIFICATION_LABELS,
  DIRECTION_LABELS,
  formatDate,
  formatMoney,
  invoiceTitle,
  STATUS_LABELS,
} from "../../domain/labels";
import type { InvoiceScan } from "../../domain/models";
import { EnteredCheckbox } from "./EnteredCheckbox";

interface Props {
  scans: InvoiceScan[];
  variant: "pending" | "completed";
}

function StatusBadge({ scan }: { scan: InvoiceScan }) {
  const warn = scan.warnings.length > 0 && scan.status === "needs_review";
  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge
        variant={scan.status === "failed" ? "destructive" : scan.enteredAt ? "outline" : "secondary"}
        className="font-medium"
      >
        {scan.enteredAt ? "Entered" : STATUS_LABELS[scan.status]}
      </Badge>
      {warn && (
        <TriangleAlert
          className="h-4 w-4 text-amber-600"
          aria-label={`${scan.warnings.length} thing${scan.warnings.length === 1 ? "" : "s"} to check`}
        />
      )}
    </span>
  );
}

/** Table on desktop, cards on mobile; the same rows either way. */
export function InvoiceScansTable({ scans, variant }: Props) {
  const dateHeader = variant === "completed" ? "Entered" : "Scanned";
  const dateOf = (scan: InvoiceScan) =>
    formatDate(variant === "completed" ? scan.enteredAt : scan.createdAt);

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <span className="sr-only">Entered in QuickBooks</span>
              </TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="whitespace-nowrap">{dateHeader}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scans.map((scan) => {
              const invoice = scan.extractedData;
              return (
                <TableRow key={scan.id} className={scan.enteredAt ? "text-muted-foreground" : undefined}>
                  <TableCell>
                    <EnteredCheckbox scan={scan} />
                  </TableCell>
                  <TableCell className="max-w-52">
                    <Link
                      href={`/finance/invoices/${scan.id}`}
                      className="block truncate font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {invoiceTitle(scan)}
                    </Link>
                    <span className="block truncate text-xs text-muted-foreground">
                      {invoice ? DIRECTION_LABELS[invoice.direction] : "Invoice file"}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {invoice?.counterpartyName || <span className="text-muted-foreground">Not identified</span>}
                  </TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">
                    {scan.projectNumber || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {invoice ? CLASSIFICATION_LABELS[invoice.classification] : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(invoice?.total, invoice?.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge scan={scan} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{dateOf(scan)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-y md:hidden">
        {scans.map((scan) => {
          const invoice = scan.extractedData;
          return (
            <li key={scan.id} className="flex gap-3 p-4">
              <EnteredCheckbox scan={scan} className="pt-1" />
              <Link
                href={`/finance/invoices/${scan.id}`}
                className="min-w-0 flex-1 space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{invoiceTitle(scan)}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {invoice?.counterpartyName || "Company not identified"}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums">
                    {formatMoney(invoice?.total, invoice?.currency)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="truncate">
                    {scan.projectNumber ? `Project ${scan.projectNumber}` : "No project"} · {dateOf(scan)}
                  </span>
                  <StatusBadge scan={scan} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
