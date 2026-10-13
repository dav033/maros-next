"use client";

import { useEffect, useId, useRef, useState, useCallback } from "react";
import { Paperclip, Upload, X, Download, Loader2, Eye, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DndContext,
  KeyboardSensor,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { getPresignedUploadUrl, getPresignedDownloadUrl, getPresignedPreviewUrl } from "@/features/leads/actions/s3Actions";
import { FilePreviewModal } from "@/features/attachments/presentation/FilePreviewModal";

interface LeadAttachmentsSectionProps {
  leadId: number;
  attachments: string[];
  onAttachmentsChange: (attachments: string[]) => Promise<void>;
}

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

const PREVIEWABLE = [
  ...IMAGE_EXTENSIONS,
  "pdf",
  "docx",
  "doc",
];

function getFileName(key: string): string {
  const parts = key.split("/");
  const raw = parts[parts.length - 1] ?? key;
  return raw.replace(/^\d+-/, "");
}

function isPreviewable(key: string): boolean {
  const ext = getFileName(key).split(".").pop()?.toLowerCase() ?? "";
  return PREVIEWABLE.includes(ext);
}

function isImage(key: string): boolean {
  const ext = getFileName(key).split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.includes(ext);
}

function AttachmentThumbnail({
  keyName,
  onClick,
}: {
  keyName: string;
  onClick: (trigger: HTMLButtonElement) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const shouldReduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setFailed(false);
    setImageLoaded(false);

    getPresignedPreviewUrl(keyName)
      .then((result) => {
        if (cancelled) return;
        if (result.status === "ready") setUrl(result.url);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [keyName]);

  return (
    <button
      type="button"
      onClick={(event) => onClick(event.currentTarget)}
      className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line-strong bg-elev-4 p-1 hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label={`Preview ${getFileName(keyName)}`}
      title="Preview image"
    >
      {url && !failed ? (
        <motion.div
          layout={!shouldReduceMotion}
          layoutId={shouldReduceMotion || !imageLoaded ? undefined : `maros-attachment-image-${keyName}`}
          data-attachment-image-source={imageLoaded ? keyName : undefined}
          transition={{ layout: { type: "spring", stiffness: 230, damping: 28, mass: 0.9 } }}
          className="flex max-h-full max-w-full items-center justify-center"
        >
          <img
            src={url}
            alt={getFileName(keyName)}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(false);
              setFailed(true);
            }}
          />
        </motion.div>
      ) : failed ? (
        <Paperclip className="size-5 text-muted-foreground" />
      ) : (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      )}
    </button>
  );
}

interface SortableItemProps {
  id: string;
  onPreview: (key: string, trigger: HTMLButtonElement) => void;
  onDownload: (key: string) => void;
  onRemove: (key: string) => void;
  downloadingKey: string | null;
}

function SortableItem({ id, onPreview, onDownload, onRemove, downloadingKey }: SortableItemProps) {
  const shouldReduceMotion = usePrefersReducedMotion();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const canPreview = isPreviewable(id);
  const image = isImage(id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: shouldReduceMotion ? undefined : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 rounded-md border border-line bg-elev-3 p-2 text-sm"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${getFileName(id)}`}
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground shrink-0"
      >
        <GripVertical className="size-4" />
      </button>

      {image && <AttachmentThumbnail keyName={id} onClick={(trigger) => onPreview(id, trigger)} />}

      <button
        type="button"
        className="group flex min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-1 text-left hover:bg-elev-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={(event) => (canPreview ? onPreview(id, event.currentTarget) : onDownload(id))}
        disabled={!canPreview && downloadingKey === id}
        title={canPreview ? "Preview attachment" : "Open attachment"}
      >
        <span className="truncate">{getFileName(id)}</span>
        <span className="ml-auto shrink-0 rounded-full border border-line px-2 py-0.5 font-display text-[10px] uppercase tracking-wide text-muted-foreground group-hover:text-foreground">
          {canPreview ? "Preview" : "Open"}
        </span>
      </button>

      <div className="flex items-center gap-1 shrink-0">
        {canPreview && (
          <Button variant="ghost" size="icon" className="size-7" aria-label={`Preview ${getFileName(id)}`} onClick={(event) => onPreview(id, event.currentTarget)}>
            <Eye className="size-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={`Download ${getFileName(id)}`}
          onClick={() => onDownload(id)}
          disabled={downloadingKey === id}
        >
          {downloadingKey === id ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Download className="size-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          aria-label={`Remove ${getFileName(id)}`}
          onClick={() => onRemove(id)}
        >
          <X className="size-3" />
        </Button>
      </div>
    </li>
  );
}

export function LeadAttachmentsSection({
  leadId,
  attachments,
  onAttachmentsChange,
}: LeadAttachmentsSectionProps) {
  const dndContextId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; fileName: string; sourceKey: string } | null>(null);
  const previewTriggerRef = useRef<HTMLButtonElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setIsUploading(true);
    try {
      const newKeys: string[] = [];
      for (const file of files) {
        const { url, key } = await getPresignedUploadUrl(file.name, file.type, leadId);
        const res = await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
        newKeys.push(key);
      }
      await onAttachmentsChange([...attachments, ...newKeys]);
      toast.success(`${newKeys.length} file(s) uploaded successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [leadId, attachments, onAttachmentsChange]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = attachments.indexOf(String(active.id));
    const newIndex = attachments.indexOf(String(over.id));
    const reordered = arrayMove(attachments, oldIndex, newIndex);
    await onAttachmentsChange(reordered);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(Array.from(e.target.files ?? []));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  };

  const handleRemove = async (key: string) => {
    await onAttachmentsChange(attachments.filter((k) => k !== key));
  };

  const handleDownload = async (key: string) => {
    setDownloadingKey(key);
    try {
      const url = await getPresignedDownloadUrl(key);
      window.open(url, "_blank");
    } catch {
      toast.error("Could not get download link");
    } finally {
      setDownloadingKey(null);
    }
  };

  const handlePreview = async (key: string, trigger: HTMLButtonElement) => {
    previewTriggerRef.current = trigger;
    try {
      const result = await getPresignedPreviewUrl(key);
      if (result.status === "not_configured") {
        toast.error("Attachment preview is unavailable in this environment.");
        return;
      }
      setPreview({ url: result.url, fileName: getFileName(key), sourceKey: key });
    } catch {
      toast.error("Could not load preview");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Paperclip className="size-4" />
            Attachments
            {attachments.length > 0 && (
              <span className="text-muted-foreground font-normal">({attachments.length})</span>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Upload className="size-4 mr-2" />
            )}
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        <button
          type="button"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={[
            "w-full border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragging
              ? "border-primary bg-primary/5 text-primary"
              : "border-line-strong text-muted-foreground hover:bg-elev-3",
            isUploading ? "opacity-60" : "",
          ].join(" ")}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-6 animate-spin" />
              <p className="text-sm">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="size-6" />
              <p className="text-sm">
                {isDragging ? "Drop files here" : "Drag & drop files or click to browse"}
              </p>
            </div>
          )}
        </button>

        {attachments.length > 0 && (
          <DndContext id={`lead-attachments-${leadId}-${dndContextId}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={attachments} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {attachments.map((key) => (
                  <SortableItem
                    key={key}
                    id={key}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onRemove={handleRemove}
                    downloadingKey={downloadingKey}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>

      <FilePreviewModal
        open={preview !== null}
        onClose={() => setPreview(null)}
        fileName={preview?.fileName ?? ""}
        presignedUrl={preview?.url ?? ""}
        sourceKey={preview?.sourceKey}
        returnFocusRef={previewTriggerRef}
      />
    </Card>
  );
}
