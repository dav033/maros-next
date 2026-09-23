"use client";

import { ExternalLink, FileText, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { InvoiceScan } from "../../domain/models";

function Document({
  scan,
  className,
}: {
  scan: Pick<InvoiceScan, "imageUrl" | "contentType" | "fileName">;
  className: string;
}) {
  if (!scan.imageUrl) return null;
  if (scan.contentType === "application/pdf") {
    return (
      <iframe
        src={`${scan.imageUrl}#toolbar=0&view=FitH`}
        title={`Original invoice · ${scan.fileName}`}
        className={`${className} w-full bg-white`}
      />
    );
  }
  return (
    <div className={`${className} relative bg-background`}>
      <Image
        src={scan.imageUrl}
        alt={`Original invoice · ${scan.fileName}`}
        fill
        unoptimized
        className="object-contain"
      />
    </div>
  );
}

/**
 * The original photo or PDF, inline next to the extracted fields so the
 * reviewer never has to leave the page to compare them. Opens full-size in a
 * dialog; the "open" link is the fallback when the browser blocks inline PDFs.
 */
export function InvoiceDocumentPreview({
  scan,
}: {
  scan: Pick<InvoiceScan, "imageUrl" | "contentType" | "fileName">;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!scan.imageUrl) {
    return (
      <figure className="grid aspect-[4/3] place-items-center rounded-xl border border-dashed bg-card px-6 text-center text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <FileText className="h-8 w-8" aria-hidden="true" />
          The original file is not available right now.
        </div>
      </figure>
    );
  }

  return (
    <figure className="overflow-hidden rounded-xl border bg-card">
      <Document scan={scan} className="aspect-[3/4] max-h-[32rem]" />
      <figcaption className="flex items-center justify-between gap-3 border-t px-3 py-2 text-xs text-muted-foreground">
        <span className="min-w-0 truncate" title={scan.fileName}>
          Original · {scan.fileName}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setExpanded(true)}
          >
            <Maximize2 aria-hidden="true" />
            Enlarge
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-7 px-2">
            <a href={scan.imageUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" />
              Open
            </a>
          </Button>
        </span>
      </figcaption>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="truncate">{scan.fileName}</DialogTitle>
          </DialogHeader>
          <Document scan={scan} className="h-[78vh]" />
        </DialogContent>
      </Dialog>
    </figure>
  );
}
