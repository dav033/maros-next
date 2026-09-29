"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { InvoiceScanDropzone } from "../components/InvoiceScanDropzone";

/**
 * The standalone page for the same dropzone the list opens in a dialog; kept so
 * a saved link to /finance/invoices/scan still works.
 */
export function InvoiceScanUploadPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3">
      <Link
        href="/finance/invoices"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All document scans
      </Link>

      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Scan a document</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
          One document per file. Take a clear photo of the whole page or choose a photo or PDF.
          The scan starts right away; you can fix any field afterwards.
        </p>
      </div>

      <InvoiceScanDropzone
        className="rounded-xl border border-line bg-elev-1 p-4 shadow-sm sm:p-5"
        onScanned={(scan) => router.push(`/finance/invoices/${scan.id}`)}
      />
    </div>
  );
}
