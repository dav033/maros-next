"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Camera, FileText, ImagePlus, LoaderCircle, ScanLine } from "lucide-react";
import Image from "next/image";
import { type DragEvent, useEffect, useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { InvoiceScan } from "../../domain/models";
import { uploadAndScanInvoice } from "../../infra/invoiceScansApi";
import { invoiceScanKeys } from "../hooks/useInvoiceScans";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  /** Called once the server has read the document. */
  onScanned: (scan: InvoiceScan) => void;
  className?: string;
}

/**
 * Picking a photo or PDF and sending it to be read, without deciding what
 * happens next: the page opens the scan, the dialog closes over the list.
 */
export function InvoiceScanDropzone({ onScanned, className }: Props) {
  const queryClient = useQueryClient();
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  async function handleFile(file?: File) {
    if (!file || busy) return;
    setError(null);
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf && !IMAGE_TYPES.has(file.type)) {
      setError("Choose a JPG, PNG or WebP photo, or a PDF file.");
      return;
    }
    if (file.size > MAX_BYTES) {
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
    setStage("Preparing file…");
    try {
      // Upload first; the server then reads the document and checks QuickBooks.
      const scan = await uploadAndScanInvoice(file, setStage);
      void queryClient.invalidateQueries({ queryKey: invoiceScanKeys.list() });
      onScanned(scan);
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

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <section
      className={cn("transition-colors", dragging && "rounded-xl bg-primary/5", className)}
      aria-label="Choose invoice photo or PDF"
      onDragOver={(event) => {
        event.preventDefault();
        if (!busy) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {preview ? (
        <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-xl border border-line bg-elev-2">
          <Image src={preview} alt="Selected invoice photo preview" fill unoptimized className="object-contain" />
        </div>
      ) : pdfName ? (
        <div className="mb-3 flex min-h-32 items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-elev-2 px-4 py-6">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-container text-primary-on-container">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">PDF ready to scan</p>
            <p className="mt-0.5 max-w-full truncate text-xs text-muted-foreground">{pdfName}</p>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "mb-3 flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-elev-2 px-4 py-6 text-center transition-colors",
            dragging && "border-primary/60 bg-primary/5",
          )}
        >
          <div className="mb-2.5 grid h-10 w-10 place-items-center rounded-lg bg-primary-container text-primary-on-container">
            <ScanLine className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold">Drop a photo or PDF here</p>
          <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
            Keep the full page flat and in focus. Name the file with the project number
            (for example <span className="font-mono">050P-…</span>) and it links itself.
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {busy ? (
        <div
          className="flex items-center justify-center gap-2.5 rounded-lg bg-elev-3 px-3 py-3 text-sm"
          role="status"
        >
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          {stage || "Working…"}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" onClick={() => cameraInput.current?.click()}>
            <Camera aria-hidden="true" />
            Take photo
          </Button>
          <Button type="button" variant="outline" onClick={() => libraryInput.current?.click()}>
            <ImagePlus aria-hidden="true" />
            Choose photo or PDF
          </Button>
        </div>
      )}

      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-label="Take a photo of the invoice"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <input
        ref={libraryInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
        className="sr-only"
        aria-label="Choose an invoice photo or PDF"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
    </section>
  );
}
