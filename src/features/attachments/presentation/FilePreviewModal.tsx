"use client";

import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  presignedUrl: string;
  sourceKey?: string;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
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

const ALLOWED_DOCX_ELEMENTS = new Set([
  "A", "B", "BLOCKQUOTE", "BR", "DIV", "EM", "H1", "H2", "H3", "H4", "H5", "H6",
  "HR", "I", "IMG", "LI", "OL", "P", "S", "SPAN", "STRONG", "SUB", "SUP", "TABLE",
  "TBODY", "TD", "TFOOT", "TH", "THEAD", "TR", "U", "UL",
]);

const DROP_DOCX_SUBTREES = new Set([
  "AUDIO", "BASE", "BUTTON", "EMBED", "FORM", "IFRAME", "INPUT", "LINK", "MATH", "META",
  "NOSCRIPT", "OBJECT", "SCRIPT", "SOURCE", "STYLE", "SVG", "TEMPLATE", "VIDEO",
]);
const SAFE_DOCX_IMAGE_SOURCE = /^data:image\/(?:png|jpe?g|gif|webp);base64,[a-z\d+/]+=*$/i;

function sanitizeDocxHtml(html: string): string {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const sanitizeNode = (node: Node) => {
    if (node.nodeType === Node.COMMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }
    if (!(node instanceof Element)) return;

    for (const child of Array.from(node.childNodes)) sanitizeNode(child);

    if (!ALLOWED_DOCX_ELEMENTS.has(node.tagName)) {
      if (DROP_DOCX_SUBTREES.has(node.tagName)) {
        node.remove();
        return;
      }
      const parent = node.parentNode;
      if (!parent) return;
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      node.remove();
      return;
    }

    if (node.tagName === "A") {
      let safeHref: string | null = null;
      try {
        const url = new URL(node.getAttribute("href")?.trim() ?? "", window.location.origin);
        if (["http:", "https:", "mailto:"].includes(url.protocol)) safeHref = url.href;
      } catch {
        // Invalid or executable links are removed.
      }
      for (const attribute of Array.from(node.attributes)) node.removeAttribute(attribute.name);
      if (safeHref) {
        node.setAttribute("href", safeHref);
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
      return;
    }

    for (const attribute of Array.from(node.attributes)) {
      const name = attribute.name.toLowerCase();
      if (node.tagName === "IMG" && name === "alt") continue;
      if (
        node.tagName === "IMG" &&
        name === "src" &&
        attribute.value.length <= 6_000_000 &&
        SAFE_DOCX_IMAGE_SOURCE.test(attribute.value)
      ) {
        continue;
      }
      if (
        (node.tagName === "TD" || node.tagName === "TH") &&
        (name === "colspan" || name === "rowspan") &&
        /^\d{1,3}$/.test(attribute.value) &&
        Number(attribute.value) > 0
      ) {
        continue;
      }

      node.removeAttribute(attribute.name);
    }

    if (node.tagName === "IMG") {
      const source = node.getAttribute("src") ?? "";
      if (
        source.length > 6_000_000 ||
        !SAFE_DOCX_IMAGE_SOURCE.test(source)
      ) {
        node.remove();
      }
    }
  };

  for (const child of Array.from(parsed.body.childNodes)) sanitizeNode(child);
  return parsed.body.innerHTML;
}

function getFileKind(name: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["docx", "doc"].includes(ext)) return "docx";
  return "unsupported";
}

function ImagePreview({ url, fileName, layoutId, hasSharedImageSource }: { url: string; fileName: string; layoutId?: string; hasSharedImageSource: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const shouldReduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [url]);

  if (error) {
    return (
      <div role="alert" className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-elev-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          This image could not be rendered in the preview.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLoaded(false);
              setError(false);
            }}
          >
            Try preview again
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4 mr-2" />
              Open image
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-64 max-h-[78dvh] items-center justify-center overflow-auto rounded-lg border border-line bg-elev-3 p-2">
      {!loaded && (
        <>
          <img
            src={url}
            alt=""
            aria-hidden="true"
            className="absolute size-px opacity-0"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
          <motion.div
            role="status"
            aria-live="polite"
            aria-label={`Loading image ${fileName}`}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="size-5 animate-spin motion-reduce:animate-none" />
            Loading image...
          </motion.div>
        </>
      )}
      {loaded && (
        <motion.div
          layout
          layoutId={shouldReduceMotion || !hasSharedImageSource ? undefined : layoutId}
          layoutCrossfade={false}
          initial={shouldReduceMotion || hasSharedImageSource ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            layout: { type: "spring", stiffness: 230, damping: 28, mass: 0.9 },
            opacity: { duration: shouldReduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] },
          }}
          className="flex max-h-[76dvh] max-w-full items-center justify-center"
        >
          <img
            src={url}
            alt={fileName}
            className="max-h-[76dvh] max-w-full rounded-sm object-contain"
            onError={() => setError(true)}
          />
        </motion.div>
      )}
    </div>
  );
}

function PdfPreview({ url, fileName }: { url: string; fileName: string }) {
  return (
    <embed
      src={url}
      type="application/pdf"
      title={`PDF preview: ${fileName}`}
      className="w-full rounded-sm border border-line"
      style={{ height: "70dvh" }}
    />
  );
}

function DocxPreview({ url }: { url: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timedOut = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
      if (!cancelled) setError("Document preview timed out.");
    }, 15_000);

    async function load() {
      setHtml(null);
      setError(null);
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Could not fetch file");
        const buffer = await res.arrayBuffer();
        const mammoth = await import("mammoth");
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        const safeHtml = sanitizeDocxHtml(result.value);
        if (!cancelled && !timedOut) {
          if (safeHtml.trim()) setHtml(safeHtml);
          else setError("This document has no safe previewable content.");
        }
      } catch {
        if (!cancelled && !timedOut) {
          setError("Could not load this document preview. Check your connection and try again.");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [attempt, url]);

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setHtml(null);
              setError(null);
              setAttempt((current) => current + 1);
            }}
          >
            Try preview again
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 size-4" />
              Open document
            </a>
          </Button>
        </div>
      </div>
    );
  }

  if (html === null) {
    return (
      <div role="status" aria-live="polite" className="flex h-40 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Loading document...</span>
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm prose-invert max-w-none overflow-auto max-h-[70dvh] rounded-sm border border-line bg-elev-3 p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function FilePreviewModal({ open, onClose, fileName, presignedUrl, sourceKey, returnFocusRef }: FilePreviewModalProps) {
  const kind = getFileKind(fileName);
  const layoutId = sourceKey ? `maros-attachment-image-${sourceKey}` : undefined;
  const shouldReduceMotion = usePrefersReducedMotion();
  const [hasSharedImageSource, setHasSharedImageSource] = useState(false);

  useLayoutEffect(() => {
    const sourceIsReady =
      open &&
      kind === "image" &&
      Boolean(layoutId) &&
      !shouldReduceMotion &&
      Array.from(
        document.querySelectorAll<HTMLElement>("[data-attachment-image-source]"),
      ).some((image) => image.dataset.attachmentImageSource === sourceKey);
    setHasSharedImageSource(sourceIsReady);
  }, [kind, layoutId, open, shouldReduceMotion, sourceKey]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          "!flex max-h-[92dvh] w-[calc(100vw-2rem)] max-w-5xl flex-col overflow-hidden p-0",
          hasSharedImageSource &&
            "data-[state=open]:!animate-none data-[state=closed]:!animate-none",
        )}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
        }}
      >
        <DialogHeader className="border-b border-line px-4 py-4 pr-12 sm:px-6 sm:pr-12">
          <DialogTitle className="truncate text-sm font-medium font-display">{fileName}</DialogTitle>
          <DialogDescription className="sr-only">
            Preview of {fileName}. Press Escape to close the preview.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {kind === "image" && (
            <ImagePreview
              url={presignedUrl}
              fileName={fileName}
              layoutId={layoutId}
              hasSharedImageSource={hasSharedImageSource}
            />
          )}
          {kind === "pdf" && <PdfPreview url={presignedUrl} fileName={fileName} />}
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
