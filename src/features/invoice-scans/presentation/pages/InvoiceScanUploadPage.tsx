"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  ImagePlus,
  LoaderCircle,
  ScanLine,
  FileText,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { uploadAndScanInvoice } from "../../infra/invoiceScansApi";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function InvoiceScanUploadPage() {
  const router = useRouter();
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  async function handlePhoto(file?: File) {
    if (!file) return;
    setError(null);
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf && !IMAGE_TYPES.has(file.type)) {
      setError("Choose a JPG, PNG, WebP photo, or PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("The file must be smaller than 5 MB.");
      return;
    }

    if (isPdf) {
      setPreview(null);
      setPdfName(file.name);
    } else {
      setPdfName(null);
      setPreview(URL.createObjectURL(file));
    }
    setBusy(true);
    setStage("Preparing photo…");
    try {
      // Upload happens first, then the server reads the photo and checks QuickBooks.
      const scan = await uploadAndScanInvoice(file, setStage);
      router.push(`/finance/invoices/${scan.id}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The invoice could not be scanned. Try again.",
      );
    } finally {
      setBusy(false);
      setStage("");
      if (cameraInput.current) cameraInput.current.value = "";
      if (libraryInput.current) libraryInput.current.value = "";
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5">
      <Link
        href="/finance/invoices"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All invoice scans
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Scan an invoice
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Take one clear photo of the full invoice or choose a photo or PDF.
          We’ll start the scan right away and suggest matching QuickBooks
          records for you to review.
        </p>
      </div>

      <section
        className="rounded-xl border bg-card p-4 sm:p-6"
        aria-label="Choose invoice photo or PDF"
      >
        {preview ? (
          <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-lg border bg-background sm:aspect-[16/9]">
            <Image
              src={preview}
              alt="Selected invoice photo preview"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        ) : pdfName ? (
          <div className="mb-5 flex min-h-52 items-center justify-center gap-4 rounded-lg border border-dashed bg-background px-6 py-8">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border bg-card text-primary">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold">PDF ready to scan</p>
              <p className="mt-1 max-w-full truncate text-sm text-muted-foreground">
                {pdfName}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-5 flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-primary/25 bg-background px-6 py-8 text-center">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border bg-card text-primary">
              <ScanLine className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="font-semibold">One invoice per photo</p>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              Keep the full page flat and in focus. Choose an existing photo or
              take one with your camera.
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-5">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {busy ? (
          <div
            className="flex items-center justify-center gap-3 rounded-md bg-muted/60 px-4 py-4 text-sm"
            role="status"
          >
            <LoaderCircle
              className="h-5 w-5 animate-spin text-primary"
              aria-hidden="true"
            />
            <span>{stage}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              size="lg"
              className="h-12 w-full sm:flex-1"
              onClick={() => cameraInput.current?.click()}
            >
              <Camera aria-hidden="true" />
              Take a photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 w-full sm:flex-1"
              onClick={() => libraryInput.current?.click()}
            >
              <ImagePlus aria-hidden="true" />
              Choose photo or PDF
            </Button>
          </div>
        )}

        {!busy && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Scanning starts automatically · JPG, PNG, WebP, or PDF · Up to 5 MB
          </p>
        )}

        <input
          ref={cameraInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="sr-only"
          aria-label="Take a photo of an invoice"
          disabled={busy}
          onChange={(event) => void handlePhoto(event.target.files?.[0])}
        />
        <input
          ref={libraryInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
          className="sr-only"
          aria-label="Choose an invoice photo or PDF"
          disabled={busy}
          onChange={(event) => void handlePhoto(event.target.files?.[0])}
        />
      </section>
    </div>
  );
}
