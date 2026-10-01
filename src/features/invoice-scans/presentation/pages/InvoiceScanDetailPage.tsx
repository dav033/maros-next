"use client";

import { AlertCircle, ArrowLeft, LoaderCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppError } from "@/shared/errors";
import { notifyError, notifySuccess } from "@/shared/presentation/toast";

import {
  CLASSIFICATION_LABELS,
  formatDate,
  invoiceTitle,
  STATUS_LABELS,
  TRANSACTION_DIRECTION_LABELS,
} from "../../domain/labels";
import type { InvoiceScan, InvoiceScanPatch } from "../../domain/models";
import { AttachDocumentPanel } from "../components/AttachDocumentPanel";
import { DeleteInvoiceScanButton } from "../components/DeleteInvoiceScanButton";
import { EnteredCheckbox } from "../components/EnteredCheckbox";
import { InvoiceDetailsForm } from "../components/InvoiceDetailsForm";
import { InvoiceDocumentPreview } from "../components/InvoiceDocumentPreview";
import { InvoiceScanWarnings } from "../components/InvoiceScanWarnings";
import { ProjectNumberSelect } from "../components/ProjectNumberSelect";
import { TransactionDetailsForm } from "../components/TransactionDetailsForm";
import {
  useInvoiceScanDetail,
  useRetryInvoiceScan,
  useUpdateInvoiceScan,
} from "../hooks/useInvoiceScans";
import { Skeleton } from "@/components/ui/skeleton";

function BackLink() {
  return (
    <Link
      href="/finance/invoices"
      className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All document scans
    </Link>
  );
}

function QboSuggestions({ scan }: { scan: InvoiceScan }) {
  const suggestions = scan.qboSuggestions;
  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6" aria-labelledby="qbo-title">
      <h2 id="qbo-title" className="font-display font-semibold">QuickBooks matches</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Suggestions only; nothing is created in QuickBooks from here.
      </p>
      {suggestions.connected === false ? (
          <p className="mt-4 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
          QuickBooks could not be reached during the scan. Match the customer or vendor by hand.
        </p>
      ) : (
        <div className="mt-4 space-y-4 text-sm">
          <p>
            Record type:{" "}
            <span className="font-semibold">{suggestions.transactionType || "Needs review"}</span>
          </p>
          {suggestions.counterparties?.length ? (
            <div>
              <h3 className="font-medium">{suggestions.counterpartyType} matches</h3>
              <ul className="mt-2 space-y-2">
                {suggestions.counterparties.map((candidate) => (
                  <li
                    key={candidate.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-elev-3 px-3 py-2"
                  >
                    <span className="min-w-0 truncate">{candidate.name}</span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {candidate.confidence}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-muted-foreground">No confident customer or vendor match found.</p>
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
  );
}

export function InvoiceScanDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const query = useInvoiceScanDetail(id);
  const update = useUpdateInvoiceScan(id);
  const retry = useRetryInvoiceScan(id);
  const scan = query.data;

  async function save(patch: InvoiceScanPatch) {
    try {
      await update.mutateAsync(patch);
      notifySuccess("Invoice details saved");
    } catch (error) {
      notifyError(error, "The invoice details could not be saved.");
      throw error;
    }
  }

  async function saveProject(projectNumber: string | null) {
    try {
      await update.mutateAsync({ projectNumber });
      notifySuccess(projectNumber ? `Linked to project ${projectNumber}` : "Project link removed");
    } catch (error) {
      notifyError(
        error,
        error instanceof AppError && error.status === 400
          ? "No project found with that number."
          : "The project could not be saved.",
      );
    }
  }

  if (query.isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading invoice">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.85fr)]">
          <Skeleton className="min-h-80 rounded-xl" />
          <Skeleton className="min-h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex w-full flex-1 flex-col gap-4">
        <BackLink />
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>This document scan could not be loaded.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const invoice = scan.extractedData;
  const isManualTransaction = scan.recordType === "transaction";
  const transactionDirection = invoice?.transactionDirection;
  const processing = scan.status === "processing" || retry.isPending;
  const canRetry = !processing && (scan.status === "uploaded" || scan.status === "failed");

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <BackLink />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {invoiceTitle(scan)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isManualTransaction ? (
              <>
                {invoice?.counterpartyName || "Counterparty not identified"}
                {transactionDirection ? ` · ${TRANSACTION_DIRECTION_LABELS[transactionDirection]}` : " · Manual transaction"}
                {" · dated "}
                {formatDate(invoice?.issueDate)}
              </>
            ) : (
              <>
                {invoice?.counterpartyName || "Company not identified"}
                {invoice ? ` · ${CLASSIFICATION_LABELS[invoice.classification]}` : ""}
                {" · scanned "}
                {formatDate(scan.createdAt)}
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Badge
            variant={scan.status === "failed" ? "destructive" : scan.enteredAt ? "outline" : "secondary"}
            className="font-medium"
          >
            {scan.enteredAt ? `Entered ${formatDate(scan.enteredAt)}` : STATUS_LABELS[scan.status]}
          </Badge>
          {canRetry && (
            <Button type="button" size="sm" onClick={() => retry.mutate()}>
              <RotateCcw aria-hidden="true" />
              {scan.status === "failed" ? "Scan again" : "Scan file"}
            </Button>
          )}
          <DeleteInvoiceScanButton
            scan={scan}
            onDeleted={() => router.push("/finance/invoices")}
          />
        </div>
      </header>

      {!isManualTransaction && retry.isError && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>
            The file could not be scanned. Check the document and try again, or type the details in below.
          </AlertDescription>
        </Alert>
      )}
      {!isManualTransaction && scan.errorMessage && scan.status === "failed" && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{scan.errorMessage}</AlertDescription>
        </Alert>
      )}
      {!isManualTransaction && <InvoiceScanWarnings warnings={scan.warnings} />}

      <section
        aria-label="Review"
        className="grid gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
      >
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Project</p>
          <ProjectNumberSelect
            value={scan.projectNumber}
            onChange={(projectNumber) => void saveProject(projectNumber)}
            saving={update.isPending && update.variables?.projectNumber !== undefined}
            disabled={processing}
          />
        </div>
        <EnteredCheckbox
          scan={scan}
          withLabel
          className="rounded-md border border-line-strong px-3 py-2 lg:mb-0.5"
        />
      </section>

      {processing ? (
        <div className="flex min-h-48 items-center justify-center gap-2 rounded-xl border bg-card text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Scanning invoice…
        </div>
      ) : isManualTransaction ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
          <section className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
            <TransactionDetailsForm
              data={invoice}
              onSave={save}
              saving={update.isPending && update.variables?.projectNumber === undefined}
              disabled={!!scan.enteredAt}
            />
            {scan.enteredAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                This transaction is marked as entered in QuickBooks. Untick "Entered"
                above to edit it.
              </p>
            )}
          </section>

          <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
            {scan.hasFile ? (
              <InvoiceDocumentPreview scan={scan} />
            ) : (
              <AttachDocumentPanel scanId={scan.id} />
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
          <section className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
            <InvoiceDetailsForm
              data={invoice}
              onSave={save}
              saving={update.isPending && update.variables?.projectNumber === undefined}
              disabled={!!scan.enteredAt}
            />
            {scan.enteredAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                This invoice is already entered in QuickBooks. Untick "Entered" above to edit it.
              </p>
            )}
          </section>

          <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
            <InvoiceDocumentPreview scan={scan} />
            {invoice && <QboSuggestions scan={scan} />}
          </div>
        </div>
      )}
    </div>
  );
}
