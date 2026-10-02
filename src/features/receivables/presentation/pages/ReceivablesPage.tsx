"use client";

import { AlertTriangle, Lock, PiggyBank, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isForbiddenError, useReceivables } from "../hooks/data/useReceivables";
import { AgingTotalsRow } from "../organisms/AgingTotalsRow";
import { MissingDatesNotice } from "../organisms/MissingDatesNotice";
import { ReceivablesTable } from "../organisms/ReceivablesTable";

export function ReceivablesPage() {
  const { data, isPending, error, refetch, isRefetching } = useReceivables();

  return (
    <section className="flex w-full flex-1 flex-col gap-4">
      <header className="rounded-2xl border border-line bg-elev-1 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold">Receivables</h1>
            <p className="text-sm text-muted-foreground">
              Work that is finished and not collected
              {data ? `, as of ${data.asOf}` : ""}
            </p>
          </div>
        </div>
      </header>

      {isPending ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : data.projects.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <AgingTotalsRow totals={data.totals} grandTotal={data.grandTotal} />
          <MissingDatesNotice
            unknown={data.totals.unknown}
            projectTotal={data.projects.length}
          />
          <ReceivablesTable projects={data.projects} />
        </>
      )}
    </section>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading receivables">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
  isRetrying,
}: {
  error: unknown;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  // A 403 here is not a failure to explain away: the request worked and the answer was
  // "not for you", so it gets its own copy and no retry button to rattle.
  if (isForbiddenError(error)) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-elev-2 p-8 text-center">
        <span className="grid size-10 place-items-center rounded-full bg-elev-4 text-muted-foreground">
          <Lock className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium">You do not have access to collections data</p>
        <p className="max-w-md text-xs text-muted-foreground">
          This view needs the finance permission. Ask an administrator to grant it and the
          report will load for you.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-8 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-rose-500/15 text-rose-300">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium">We could not load the receivables report</p>
      <p className="max-w-md text-xs text-muted-foreground">
        Nothing was changed. Try again, and if it keeps failing the finance API is likely
        down.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong bg-elev-2 p-8 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
        <PiggyBank className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium">Nothing pending collection</p>
      <p className="max-w-md text-xs text-muted-foreground">
        No project in this report has an outstanding balance or a missing invoice.
      </p>
    </div>
  );
}
