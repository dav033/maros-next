"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  presignedUrl: string;
}

type FileKind = "image" | "pdf" | "docx" | "unsupported";

const IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "avif",
  "bmp",
  "ico",
  "tif",
  "tiff",
  "heic",
  "heif",
];

function getFileKind(name: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["docx", "doc"].includes(ext)) return "docx";
  return "unsupported";
}

function ImagePreview({ url, fileName }: { url: string; fileName: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [url]);

  if (error) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          This image could not be rendered in the preview.
        </p>
        <Button asChild variant="outline" size="sm">
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4 mr-2" />
            Open image
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-64 max-h-[78vh] items-center justify-center overflow-auto rounded-lg border border-border bg-black/30 p-2">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading image...
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={fileName}
        className="max-h-[76vh] max-w-full rounded object-contain"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

function PdfPreview({ url }: { url: string }) {
  return (
    <embed
      src={url}
      type="application/pdf"
      className="w-full rounded border"
      style={{ height: "70vh" }}
    />
  );
}

function DocxPreview({ url }: { url: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Could not fetch file");
        const buffer = await res.arrayBuffer();
        const mammoth = await import("mammoth");
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        if (!cancelled) setHtml(result.value);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Preview failed");
      }
    }
    load();
    return () => { cancelled = true; };
  }, [url]);

  if (error) {
    return <p className="text-sm text-destructive p-4">{error}</p>;
  }

  if (html === null) {
    return (
      <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Loading document...</span>
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none overflow-auto max-h-[70vh] p-4 border rounded bg-background"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function FilePreviewModal({ open, onClose, fileName, presignedUrl }: FilePreviewModalProps) {
  const kind = getFileKind(fileName);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="!flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-5xl flex-col overflow-hidden bg-background p-0">
        <DialogHeader className="border-b border-border/70 px-5 py-4 pr-12 sm:px-6 sm:pr-12">
          <DialogTitle className="truncate text-sm font-medium">{fileName}</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {kind === "image" && <ImagePreview url={presignedUrl} fileName={fileName} />}
          {kind === "pdf" && <PdfPreview url={presignedUrl} />}
          {kind === "docx" && <DocxPreview url={presignedUrl} />}
          {kind === "unsupported" && (
            <p className="text-sm text-muted-foreground p-4 text-center">
              Preview not available for this file type.{" "}
              <a href={presignedUrl} target="_blank" rel="noreferrer" className="underline">
                Download instead
              </a>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
