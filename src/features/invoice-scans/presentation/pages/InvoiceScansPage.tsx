"use client";

import { AlertCircle, Camera, CheckCircle2, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { PageHeaderCard } from "@/components/shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { partitionInvoiceScans } from "../../domain/partition";
import { InvoiceScansTable } from "../components/InvoiceScansTable";
import { useInvoiceScansList } from "../hooks/useInvoiceScans";

function LoadingRows() {
  return (
    <div className="divide-y" role="status" aria-label="Loading invoice scans">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4 sm:px-6">
          <span className="h-4 w-4 animate-pulse rounded bg-muted" />
          <span className="h-4 w-40 max-w-[30%] animate-pulse rounded bg-muted" />
          <span className="hidden h-4 w-36 animate-pulse rounded bg-muted sm:block" />
          <span className="ml-auto h-5 w-24 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function InvoiceScansPage() {
  const query = useInvoiceScansList();
  const { pending, completed } = useMemo(
    () => partitionInvoiceScans(query.data ?? []),
    [query.data],
  );

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <PageHeaderCard
        icon={FileText}
        title="Invoice scans"
        description="Scanned invoices and manual transactions waiting to be entered in QuickBooks."
        rightSlot={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/finance/invoices/transaction">
                <Plus aria-hidden="true" />
                Add transaction
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/finance/invoices/scan">
                <Plus aria-hidden="true" />
                Scan invoice
              </Link>
            </Button>
          </div>
        }
      />

      {query.isError && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>Invoice scans could not be loaded. Check your connection and try again.</span>
            <Button type="button" variant="outline" size="sm" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <section aria-labelledby="pending-title" className="overflow-hidden rounded-2xl border border-line bg-elev-1 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-elev-2 px-4 py-4 sm:px-6">
          <h2 id="pending-title" className="font-display font-semibold">
            To enter
            {!query.isLoading && (
              <span className="ml-2 rounded-full bg-primary/15 px-2.5 py-1 font-mono text-xs font-medium text-primary tabular-nums">
                {pending.length}
              </span>
            )}
          </h2>
          <p className="text-xs text-muted-foreground">
            A reminder goes out every three days while anything is left here.
          </p>
        </header>
        {query.isLoading ? (
          <LoadingRows />
        ) : pending.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Camera className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-lg font-semibold tracking-tight">
              {query.data?.length ? "Everything is entered" : "No invoices or transactions yet"}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {query.data?.length
                ? "New scans will show up here until they are marked as entered in QuickBooks."
                : "Scan an invoice or add a payment manually. Items appear here to review before entering them in QuickBooks."}
            </p>
          </div>
        ) : (
          <InvoiceScansTable scans={pending} variant="pending" />
        )}
      </section>

      {completed.length > 0 && (
        <section aria-labelledby="completed-title" className="overflow-hidden rounded-2xl border border-line bg-elev-1 shadow-sm">
          <header className="flex flex-wrap items-center gap-2 border-b border-line bg-elev-2 px-4 py-4 sm:px-6">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            <h2 id="completed-title" className="font-display font-semibold">
              Entered in QuickBooks
              <span className="ml-2 rounded-full bg-elev-4 px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground tabular-nums">
                {completed.length}
              </span>
            </h2>
            <p className="ml-auto text-xs text-muted-foreground">Untick one to send it back.</p>
          </header>
          <InvoiceScansTable scans={completed} variant="completed" />
        </section>
      )}
    </div>
  );
}
