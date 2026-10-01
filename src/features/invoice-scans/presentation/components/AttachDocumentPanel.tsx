"use client";

import { LoaderCircle, Paperclip } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { useAttachInvoiceScanFile } from "../hooks/useInvoiceScans";

const ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

/**
 * Adjuntar el documento después, para una transacción que se guardó sin archivo
 * (adjuntar nunca es obligatorio al crearla).
 */
export function AttachDocumentPanel({ scanId }: { scanId: string }) {
  const attach = useAttachInvoiceScanFile();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf && !ATTACHMENT_TYPES.has(file.type)) {
      setError("Attach a JPG, PNG or WebP photo, or a PDF file.");
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError("The file must be smaller than 5 MB.");
      return;
    }
    setError(null);
    attach.mutate({ id: scanId, file });
  }

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6" aria-labelledby="attach-title">
      <h2 id="attach-title" className="font-display font-semibold">
        Document
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        No invoice or receipt attached. Add one and it can be downloaded from here or
        from the list.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        disabled={attach.isPending}
        onClick={() => input.current?.click()}
      >
        {attach.isPending ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <Paperclip aria-hidden="true" />
        )}
        Attach document
      </Button>
      {error && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
        className="sr-only"
        aria-label="Attach an invoice or receipt"
        onChange={choose}
      />
    </section>
  );
}
