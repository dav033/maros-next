"use client";

import { AlertCircle, Camera, CheckCircle2, FileText, Plus, ScanLine } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeaderCard } from "@/components/shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { partitionInvoiceScans } from "../../domain/partition";
import { AddTransactionDialog } from "../components/AddTransactionDialog";
import { InvoiceScansTable } from "../components/InvoiceScansTable";
import { ScanInvoiceDialog } from "../components/ScanInvoiceDialog";
import { useInvoiceScansList } from "../hooks/useInvoiceScans";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingRows() {
  return (
    <div className="divide-y divide-line" role="status" aria-label="Loading document scans">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-3.5 w-40 max-w-[30%]" />
          <Skeleton className="hidden h-3.5 w-36 sm:block" />
          <Skeleton className="ml-auto h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function InvoiceScansPage() {
  const query = useInvoiceScansList();
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const { pending, completed } = useMemo(
    () => partitionInvoiceScans(query.data ?? []),
    [query.data],
  );

  return (
    <div className="flex w-full flex-1 flex-col gap-3">
      <PageHeaderCard
        icon={FileText}
        title="Document scans"
        description="Scanned documents and manual transactions waiting to be entered in QuickBooks."
        rightSlot={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg"
              onClick={() => setTransactionOpen(true)}
            >
              <Plus aria-hidden="true" />
              Add transaction
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-lg"
              onClick={() => setScanOpen(true)}
            >
              <ScanLine aria-hidden="true" />
              Scan invoice
            </Button>
          </div>
        }
      />

      <AddTransactionDialog open={transactionOpen} onOpenChange={setTransactionOpen} />
      <ScanInvoiceDialog open={scanOpen} onOpenChange={setScanOpen} />

      {query.isError && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>Document scans could not be loaded. Check your connection and try again.</span>
            <Button type="button" variant="outline" size="sm" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <section aria-labelledby="pending-title" className="overflow-hidden rounded-xl border border-line bg-elev-1 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-elev-2 px-3 py-2 sm:px-4">
          <h2 id="pending-title" className="font-display text-sm font-semibold">
            To enter
            {!query.isLoading && (
              <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-xs font-medium text-primary tabular-nums">
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
          <div className="flex min-h-40 flex-col items-center justify-center px-6 py-8 text-center">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-primary-container text-primary-on-container">
              <Camera className="h-4 w-4" aria-hidden="true" />
            </div>
            <h3 className="font-display text-base font-semibold tracking-tight">
              {query.data?.length ? "Everything is entered" : "No documents or transactions yet"}
            </h3>
            <p className="mt-1.5 max-w-md text-xs leading-5 text-muted-foreground">
              {query.data?.length
                ? "New scans will show up here until they are marked as entered in QuickBooks."
                : "Scan a document or add a payment manually. Items appear here to review before entering them in QuickBooks."}
            </p>
          </div>
        ) : (
          <InvoiceScansTable scans={pending} variant="pending" />
        )}
      </section>

      {completed.length > 0 && (
        <section aria-labelledby="completed-title" className="overflow-hidden rounded-xl border border-line bg-elev-1 shadow-sm">
          <header className="flex flex-wrap items-center gap-2 border-b border-line bg-elev-2 px-3 py-2 sm:px-4">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 id="completed-title" className="font-display text-sm font-semibold">
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
