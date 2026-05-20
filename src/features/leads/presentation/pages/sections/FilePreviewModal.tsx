"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  presignedUrl: string;
}

type FileKind = "image" | "pdf" | "docx" | "unsupported";

function getFileKind(name: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["docx", "doc"].includes(ext)) return "docx";
  return "unsupported";
}

function ImagePreview({ url }: { url: string }) {
  return (
    <div className="flex items-center justify-center max-h-[70vh] overflow-auto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="preview" className="max-w-full object-contain rounded" />
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
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="truncate text-sm font-medium">{fileName}</DialogTitle>
        </DialogHeader>

        {kind === "image" && <ImagePreview url={presignedUrl} />}
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
      </DialogContent>
    </Dialog>
  );
}
