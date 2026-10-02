"use client";

import { ArrowDownLeft, ArrowUpRight, TriangleAlert } from "lucide-react";
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
import { useUserDirectory } from "@/features/users/presentation/hooks/data/useUserDirectory";

import {
  COUNTERPARTY_PREFIX,
  DIRECTION_LABELS,
  formatDate,
  formatMoney,
  invoiceTitle,
  moneyFlow,
  STATUS_LABELS,
  TRANSACTION_DIRECTION_LABELS,
} from "../../domain/labels";
import type { InvoiceScan } from "../../domain/models";
import { EnteredCheckbox } from "./EnteredCheckbox";
import {
  AmountCell,
  CategoryCell,
  CommentsCell,
  lastEditorLabel,
  ProjectCell,
} from "./InvoiceRowEditors";
import { InvoiceScanRowActions } from "./InvoiceScanRowActions";

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

/**
 * Quién cobró o pagó. La flecha y el `title` dicen de qué lado está, para que
 * una sola columna estrecha sirva a los dos sentidos.
 */
function CounterpartyCell({ scan }: { scan: InvoiceScan }) {
  const name = scan.extractedData?.counterpartyName?.trim();
  if (!name) return <span className="text-muted-foreground">—</span>;

  const flow = moneyFlow(scan);
  const prefix = COUNTERPARTY_PREFIX[flow];
  const Arrow = flow === "in" ? ArrowDownLeft : flow === "out" ? ArrowUpRight : null;
  return (
    <span className="flex items-center gap-1" title={`${prefix}: ${name}`}>
      {Arrow && (
        <Arrow className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <span className="sr-only">{prefix}:</span>
      <span className="truncate">{name}</span>
    </span>
  );
}

function recordDirection(scan: InvoiceScan): string {
  if (scan.recordType === "transaction") {
    const direction = scan.extractedData?.transactionDirection;
    return direction ? TRANSACTION_DIRECTION_LABELS[direction] : "Manual transaction";
  }
  return scan.extractedData ? DIRECTION_LABELS[scan.extractedData.direction] : "Invoice file";
}

/** Table on desktop, cards on mobile; the same rows either way. */
export function InvoiceScansTable({ scans, variant }: Props) {
  const dateHeader = variant === "completed" ? "Entered" : "Date";
  const { users } = useUserDirectory(true);
  const dateOf = (scan: InvoiceScan) => {
    if (variant === "completed") return formatDate(scan.enteredAt);
    return formatDate(scan.recordType === "transaction" ? scan.extractedData?.issueDate : scan.createdAt);
  };
  const editorOf = (scan: InvoiceScan) => lastEditorLabel(scan, users);

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader className="bg-elev-2">
            <TableRow>
              <TableHead className="w-10 px-2">
                <span className="sr-only">Entered in QuickBooks</span>
              </TableHead>
              <TableHead className="px-2">Document</TableHead>
              <TableHead className="w-40 px-2">Paid to / from</TableHead>
              <TableHead className="w-28 px-2">Project</TableHead>
              <TableHead className="w-36 px-2">Category</TableHead>
              <TableHead className="w-44 px-2">Comments</TableHead>
              <TableHead className="w-24 px-2 text-right">Total</TableHead>
              <TableHead className="w-32 px-2">{variant === "completed" ? dateHeader : "Status"}</TableHead>
              <TableHead className="w-10 px-2">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scans.map((scan) => {
              return (
                <TableRow key={scan.id} className={scan.enteredAt ? "text-muted-foreground" : "transition-colors hover:bg-elev-3"}>
                  <TableCell className="px-2">
                    <EnteredCheckbox scan={scan} />
                  </TableCell>
                  {/* La contraparte salió de aquí a su propia columna: como
                      subtítulo truncado del documento era justo el dato que no
                      se encontraba. */}
                  <TableCell className="max-w-64 px-2">
                    <Link
                      href={`/finance/invoices/${scan.id}`}
                      className="block truncate font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {invoiceTitle(scan)}
                    </Link>
                    <span className="block truncate text-xs text-muted-foreground">
                      {recordDirection(scan)}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-40 px-2 text-sm">
                    <CounterpartyCell scan={scan} />
                  </TableCell>
                  <TableCell className="px-2">
                    <ProjectCell scan={scan} />
                  </TableCell>
                  <TableCell className="px-2">
                    <CategoryCell scan={scan} />
                  </TableCell>
                  <TableCell className="px-2">
                    <CommentsCell scan={scan} />
                  </TableCell>
                  <TableCell className="px-2 text-right">
                    <AmountCell scan={scan} />
                  </TableCell>
                  {/* Estado, fecha y último editor apilados: tres datos cortos que
                      no necesitan una columna cada uno. */}
                  <TableCell className="px-2">
                    <StatusBadge scan={scan} />
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {dateOf(scan)}
                      {editorOf(scan) ? ` · ${editorOf(scan)}` : ""}
                    </span>
                  </TableCell>
                  <TableCell className="px-2">
                    <InvoiceScanRowActions scan={scan} />
                  </TableCell>
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
            <li key={scan.id} className="flex gap-2 p-4 transition-colors hover:bg-elev-3">
              <EnteredCheckbox scan={scan} className="pt-1" />
              <Link
                href={`/finance/invoices/${scan.id}`}
                className="min-w-0 flex-1 space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{invoiceTitle(scan)}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {invoice?.counterpartyName || "Counterparty not identified"}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono font-semibold tabular-nums">
                    {formatMoney(invoice?.total, invoice?.currency)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="truncate">
                    {recordDirection(scan)} · {scan.projectNumber ? `Project ${scan.projectNumber}` : "No project"} · {dateOf(scan)}
                  </span>
                  <StatusBadge scan={scan} />
                </div>
                {scan.comments && <p className="line-clamp-2 text-xs text-muted-foreground">{scan.comments}</p>}
              </Link>
              <span className="shrink-0">
                <InvoiceScanRowActions scan={scan} />
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
