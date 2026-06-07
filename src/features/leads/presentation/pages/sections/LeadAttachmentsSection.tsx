"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Paperclip, Upload, X, Download, Loader2, Eye, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getPresignedUploadUrl, getPresignedDownloadUrl, getPresignedPreviewUrl } from "@/features/leads/actions/s3Actions";
import { FilePreviewModal } from "./FilePreviewModal";

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
  onClick: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setFailed(false);

    getPresignedPreviewUrl(keyName)
      .then((nextUrl) => {
        if (!cancelled) setUrl(nextUrl);
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
      onClick={onClick}
      className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/70 bg-background/70 p-1 hover:border-primary/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label={`Preview ${getFileName(keyName)}`}
      title="Preview image"
    >
      {url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={getFileName(keyName)}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
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
  onPreview: (key: string) => void;
  onDownload: (key: string) => void;
  onRemove: (key: string) => void;
  downloadingKey: string | null;
}

function SortableItem({ id, onPreview, onDownload, onRemove, downloadingKey }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const canPreview = isPreviewable(id);
  const image = isImage(id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 text-sm p-2 rounded-md border bg-muted/30"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground shrink-0"
        tabIndex={-1}
      >
        <GripVertical className="size-4" />
      </button>

      {image && <AttachmentThumbnail keyName={id} onClick={() => onPreview(id)} />}

      <button
        type="button"
        className="group flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-1 text-left hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={() => (canPreview ? onPreview(id) : onDownload(id))}
        disabled={!canPreview && downloadingKey === id}
        title={canPreview ? "Preview attachment" : "Open attachment"}
      >
        <span className="truncate">{getFileName(id)}</span>
        <span className="ml-auto shrink-0 rounded-full border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground group-hover:text-foreground">
          {canPreview ? "Preview" : "Open"}
        </span>
      </button>

      <div className="flex items-center gap-1 shrink-0">
        {canPreview && (
          <Button variant="ghost" size="icon" className="size-7" onClick={() => onPreview(id)}>
            <Eye className="size-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; fileName: string } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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

  const handlePreview = async (key: string) => {
    try {
      const url = await getPresignedPreviewUrl(key);
      setPreview({ url, fileName: getFileName(key) });
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

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={[
            "border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5 text-primary"
              : "border-muted-foreground/25 text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/30",
            isUploading ? "pointer-events-none opacity-60" : "",
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
        </div>

        {attachments.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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

      {preview && (
        <FilePreviewModal
          open
          onClose={() => setPreview(null)}
          fileName={preview.fileName}
          presignedUrl={preview.url}
        />
      )}
    </Card>
  );
}
