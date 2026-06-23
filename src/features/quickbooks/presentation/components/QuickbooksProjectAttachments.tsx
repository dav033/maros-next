"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  File,
  FileImage,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  RefreshCw,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  useQuickbooksAttachmentDownloadUrl,
  useQuickbooksProjectAttachments,
} from "../../application/queries";
import type { QboAttachment, QboProjectAttachments } from "../../domain/models";
import { useGroupedQboAttachments } from "../hooks/useGroupedQboAttachments";
import { useFilteredQboAttachments } from "../hooks/useFilteredQboAttachments";

interface QuickbooksProjectAttachmentsProps {
  projectNumber: string;
  className?: string;
}

function formatBytes(bytes: number | null): string {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFileIcon(contentType: string, fileName: string) {
  if (contentType?.startsWith("image/")) return ImageIcon;
  if (contentType === "application/pdf" || fileName?.toLowerCase().endsWith(".pdf")) return FileText;
  if (contentType?.startsWith("video/")) return FileImage;
  return File;
}

function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text;
  const normalizedQuery = query.toLowerCase();
  const lower = text.toLowerCase();
  const idx = lower.indexOf(normalizedQuery);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-amber-200/70 px-0.5 text-foreground dark:bg-amber-500/30">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface AttachmentRowProps {
  attachment: QboAttachment;
  searchTerm: string;
  onRefreshed: (url: string, expires: string | null) => void;
  onError: (message: string) => void;
}

function AttachmentRow({ attachment, searchTerm, onRefreshed, onError }: AttachmentRowProps) {
  const [currentUrl, setCurrentUrl] = useState<string | undefined>(attachment.tempDownloadUrl);
  const [currentExpires, setCurrentExpires] = useState<string | null>(attachment.downloadUrlExpires);
  const refreshQuery = useQuickbooksAttachmentDownloadUrl(attachment.attachmentId, {
    enabled: false,
  });

  const Icon = getFileIcon(attachment.contentType, attachment.fileName);

  const handleOpen = useCallback(() => {
    if (!currentUrl) {
      onError("No download URL is available for this attachment.");
      return;
    }
    window.open(currentUrl, "_blank", "noopener,noreferrer");
  }, [currentUrl, onError]);

  const handleDownload = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!currentUrl) {
        onError("No download URL is available for this attachment.");
        return;
      }
      const link = document.createElement("a");
      link.href = currentUrl;
      link.download = attachment.fileName || attachment.attachmentId;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [currentUrl, attachment, onError],
  );

  const handleRefresh = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      try {
        const result = await refreshQuery.refetch();
        if (result.data?.tempDownloadUrl) {
          setCurrentUrl(result.data.tempDownloadUrl);
          setCurrentExpires(result.data.downloadUrlExpires);
          onRefreshed(result.data.tempDownloadUrl, result.data.downloadUrlExpires);
          toast.success("Download link refreshed");
        } else {
          onError("QuickBooks did not return a download URL.");
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : "Failed to refresh link");
      }
    },
    [refreshQuery, onRefreshed, onError],
  );

  const isRefreshing = refreshQuery.isFetching;
  const displayName = attachment.fileName || "(untitled)";
  const canOpen = Boolean(currentUrl);

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={!canOpen}
      title={canOpen ? `Open ${displayName} in a new tab` : "No download URL available"}
      aria-label={canOpen ? `Open ${displayName} in a new tab` : `${displayName} (no URL)`}
      className="group flex w-full items-start gap-3 rounded-md border bg-card/40 p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground" title={displayName}>
            {searchTerm ? highlightMatch(displayName, searchTerm) : displayName}
          </p>
          <Badge variant="outline" className="text-[10px]">
            {attachment.linkedEntityType}
          </Badge>
          {!attachment.includeOnSend && (
            <Badge variant="secondary" className="text-[10px]">
              Private
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formatBytes(attachment.size)}</span>
          {attachment.contentType && <span className="truncate">{attachment.contentType}</span>}
          {attachment.createdAt && (
            <span title={attachment.createdAt}>
              {formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })}
            </span>
          )}
          {currentExpires && (
            <span title={`URL fetched at ${attachment.downloadUrlFetchedAt ?? ""}`}>
              URL valid until {formatDistanceToNow(new Date(currentExpires), { addSuffix: true })}
            </span>
          )}
        </div>
        {attachment.note && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {searchTerm ? highlightMatch(attachment.note, searchTerm) : attachment.note}
          </p>
        )}
      </div>
      <div
        className="flex shrink-0 items-center gap-1"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh download link"
          aria-label="Refresh download link"
        >
          {isRefreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          disabled={!canOpen}
          title="Download"
          aria-label="Download attachment"
        >
          <Download className="size-4" />
        </Button>
      </div>
    </button>
  );
}

interface SectionBlockProps {
  entityType: string;
  label: string;
  description: string;
  icon: typeof File;
  attachments: QboAttachment[];
  fallbackUsed: boolean;
  searchTerm: string;
  defaultOpen: boolean;
  onRefreshed: (url: string, expires: string | null) => void;
  onError: (message: string) => void;
}

function SectionBlock({
  label,
  description,
  icon: Icon,
  attachments,
  fallbackUsed,
  searchTerm,
  defaultOpen,
  onRefreshed,
  onError,
}: SectionBlockProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-md border bg-background/60">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-muted/40"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {label}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({attachments.length})
                </span>
              </p>
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {fallbackUsed && (
              <Badge variant="secondary" className="text-[10px]">
                Fallback scan
              </Badge>
            )}
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 px-3 pb-3">
        {attachments.map((attachment) => (
          <AttachmentRow
            key={attachment.attachmentId}
            attachment={attachment}
            searchTerm={searchTerm}
            onRefreshed={onRefreshed}
            onError={onError}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function AttachmentsSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-start gap-3 rounded-md border bg-card/40 p-3">
          <Skeleton className="size-9" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CoverageBanner({ data }: { data: QboProjectAttachments }) {
  const { coverage, project, warnings } = data;
  const notFound = !project.found;
  const lowCoverage =
    coverage.entitiesChecked > 0 &&
    coverage.attachmentsFound === 0;

  if (!notFound && !lowCoverage && warnings.length === 0) return null;

  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-300/60 bg-amber-50/40 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
      <div className="space-y-1">
        {notFound && (
          <p>
            We could not match a QuickBooks job for this project number. Double-check
            that the project is synced in QuickBooks.
          </p>
        )}
        {lowCoverage && !notFound && (
          <p>
            We checked {coverage.entitiesChecked} QuickBooks transactions linked to
            this project and did not find any attachments.
          </p>
        )}
        {warnings.length > 0 && (
          <ul className="list-inside list-disc space-y-0.5">
            {warnings.slice(0, 3).map((w) => (
              <li key={w.code}>
                <span className="font-medium">{w.code}:</span> {w.message}
              </li>
            ))}
            {warnings.length > 3 && <li>+ {warnings.length - 3} more</li>}
          </ul>
        )}
      </div>
    </div>
  );
}

interface TypeFilterChipsProps {
  sections: ReturnType<typeof useGroupedQboAttachments>["sections"];
  active: ReadonlySet<string>;
  onToggle: (entityType: string) => void;
  disabled?: boolean;
}

function TypeFilterChips({ sections, active, onToggle, disabled }: TypeFilterChipsProps) {
  if (sections.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by attachment type">
      {sections.map((section) => {
        const isActive = active.has(section.entityType);
        const Icon = section.icon;
        return (
          <button
            key={section.entityType}
            type="button"
            onClick={() => onToggle(section.entityType)}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted/60"
            }`}
            aria-pressed={isActive}
          >
            <Icon className="size-3.5" />
            <span>{section.label}</span>
            <span
              className={`rounded-full px-1.5 text-[10px] ${
                isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {section.attachments.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function QuickbooksProjectAttachments({
  projectNumber,
  className,
}: QuickbooksProjectAttachmentsProps) {
  const query = useQuickbooksProjectAttachments({
    projectNumber,
    includeTempDownloadUrl: true,
  });
  const grouped = useGroupedQboAttachments(query.data);
  const {
    filtered,
    filter,
    setQuery,
    toggleType,
    clearFilters,
    hasActiveFilter,
    totalBeforeFilter,
  } = useFilteredQboAttachments(query.data);

  const handleError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const handleRefreshed = useCallback(() => {
    // row already updates its local state; no global side effect needed
  }, []);

  const searchPlaceholder = useMemo(() => {
    return `Search ${totalBeforeFilter} file${totalBeforeFilter === 1 ? "" : "s"} by name, note, or transaction id…`;
  }, [totalBeforeFilter]);

  const noMatches = hasActiveFilter && !filtered.isEmpty && filtered.total === 0;
  const noAttachments = !hasActiveFilter && grouped.isEmpty;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="size-5" />
            QuickBooks Attachments
          </CardTitle>
          <CardDescription>
            Files linked to this project and its invoices, estimates, payments, and
            other QuickBooks transactions.
          </CardDescription>
        </div>
        {grouped.total > 0 && (
          <Badge variant="outline" className="shrink-0">
            {hasActiveFilter
              ? `${filtered.total} of ${grouped.total}`
              : `${grouped.total} file${grouped.total === 1 ? "" : "s"}`}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isLoading || query.isFetching ? (
          <AttachmentsSkeleton />
        ) : query.error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            Could not load QuickBooks attachments. Try again in a moment.
          </div>
        ) : !query.data ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No data available.
          </div>
        ) : (
          <>
            <CoverageBanner data={query.data} />
            {noAttachments ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                <p>No QuickBooks attachments found for this project.</p>
                <p className="mt-1 text-xs">
                  Upload files directly in QuickBooks and they will show up here.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={totalBeforeFilter === 0 ? "" : filter.query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="h-9 pl-8 pr-8"
                      aria-label="Search QuickBooks attachments"
                      disabled={totalBeforeFilter === 0}
                    />
                    {filter.query && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuery("")}
                        className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                        aria-label="Clear search"
                      >
                        <X className="size-3.5" />
                      </Button>
                    )}
                  </div>
                  {hasActiveFilter && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="self-start text-muted-foreground"
                    >
                      <X className="mr-1 size-3.5" />
                      Clear filters
                    </Button>
                  )}
                </div>

                <TypeFilterChips
                  sections={grouped.sections}
                  active={filter.types}
                  onToggle={toggleType}
                  disabled={totalBeforeFilter === 0}
                />

                {noMatches ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    <p>No attachments match your search.</p>
                    <p className="mt-1 text-xs">Try a different term or clear the filters.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.sections.map((section) => (
                      <SectionBlock
                        key={section.entityType}
                        entityType={section.entityType}
                        label={section.label}
                        description={section.description}
                        icon={section.icon}
                        attachments={section.attachments}
                        fallbackUsed={section.fallbackUsed}
                        searchTerm={filter.query.trim()}
                        defaultOpen={hasActiveFilter || section.attachments.length <= 5}
                        onRefreshed={handleRefreshed}
                        onError={handleError}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
