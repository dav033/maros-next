"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  KeyRound,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { NoteAccessPanel, NoteShareLink } from "@/notes/domain";
import { useNoteSharingMutations } from "../hooks/mutations/useNoteSharingMutations";
import { formatRelativeTime } from "../atoms/formatRelativeTime";

/**
 * "Never" is offered but is not the default. A link with no expiry is a document left
 * on the internet indefinitely, and the whole point of putting 30 days first is that
 * the safe option is also the easy one.
 */
const EXPIRY_OPTIONS = [
  { value: "7", label: "In 7 days" },
  { value: "30", label: "In 30 days (recommended)" },
  { value: "90", label: "In 90 days" },
  { value: "never", label: "Never" },
] as const;

function expiryToIso(value: string): string | undefined {
  if (value === "never") return undefined;
  const date = new Date();
  date.setDate(date.getDate() + Number(value));
  return date.toISOString();
}

export interface SharePublicLinkPanelProps {
  pageId: number;
  panel: NoteAccessPanel | null;
  isLoading: boolean;
  canManage: boolean;
}

export function SharePublicLinkPanel({
  pageId,
  panel,
  isLoading,
  canManage,
}: SharePublicLinkPanelProps) {
  const [password, setPassword] = useState("");
  const [expiry, setExpiry] = useState<string>("30");
  const [includeChildren, setIncludeChildren] = useState(false);
  const [allowIndexing, setAllowIndexing] = useState(false);
  /**
   * Held in component state because it exists nowhere else: the server stores only a
   * SHA-256 of the token, so once this dialog closes the URL is unrecoverable and the
   * only remedy is rotating the link.
   */
  const [freshUrl, setFreshUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState<null | {
    kind: "rotate" | "revoke";
    link: NoteShareLink;
  }>(null);

  const { publishMutation, rotateLinkMutation, unpublishMutation, updateLinkMutation } =
    useNoteSharingMutations(pageId);

  const activeLink = panel?.links.find((link) => link.isActive) ?? null;

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const publish = () => {
    publishMutation.mutate(
      {
        id: pageId,
        draft: {
          password: password.trim() ? password.trim() : undefined,
          includeChildren,
          allowIndexing,
          expiresAt: expiryToIso(expiry),
        },
      },
      {
        onSuccess: (link) => {
          setFreshUrl(link.url ?? null);
          setPassword("");
        },
      }
    );
  };

  const confirmAction = () => {
    if (!confirming) return;
    const { kind, link } = confirming;
    setConfirming(null);

    if (kind === "rotate") {
      rotateLinkMutation.mutate(
        { id: pageId, linkId: link.id },
        { onSuccess: (fresh) => setFreshUrl(fresh.url ?? null) }
      );
    } else {
      unpublishMutation.mutate({ id: pageId, linkId: link.id });
      setFreshUrl(null);
    }
  };

  if (isLoading || !panel) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        Only the note’s owner can publish it to the web.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {!activeLink ? (
        <>
          <div className="space-y-3 rounded-lg border border-border/60 p-3">
            <div className="space-y-1.5">
              <Label htmlFor="share-password" className="text-xs">
                Password (optional)
              </Label>
              <Input
                id="share-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Expires</Label>
              <Select value={expiry} onValueChange={setExpiry}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Include sub-pages</span>
              <Switch checked={includeChildren} onCheckedChange={setIncludeChildren} />
            </label>

            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0">
                Allow search engines
                <span className="block text-xs text-muted-foreground">
                  Off by default — a published quote should not rank in Google
                </span>
              </span>
              <Switch checked={allowIndexing} onCheckedChange={setAllowIndexing} />
            </label>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Anyone with the link will be able to read this note without signing in.
            </span>
          </div>

          <Button
            className="w-full"
            onClick={publish}
            disabled={publishMutation.isPending}
          >
            Publish to the web
          </Button>
        </>
      ) : (
        <>
          {freshUrl ? (
            <div className="space-y-1.5">
              <Label className="text-xs">Public link</Label>
              <div className="flex min-w-0 gap-2">
                <Input readOnly value={freshUrl} className="min-w-0 flex-1 font-mono text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => void copy(freshUrl)}
                  title="Copy link"
                  aria-label={copied ? "Link copied" : "Copy link"}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy it now — it is not stored and cannot be shown again.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 p-3 text-sm">
              <div className="font-medium">This note is published</div>
              <p className="mt-1 text-xs text-muted-foreground">
                The URL ends in{" "}
                <span className="font-mono">…{activeLink.tokenHint}</span>. Only a hash of
                it is stored, so it cannot be shown again — generate a new link if you
                lost it.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {activeLink.viewCount} view{activeLink.viewCount === 1 ? "" : "s"}
              {activeLink.lastViewedAt &&
                ` · last ${formatRelativeTime(activeLink.lastViewedAt)}`}
            </span>
            {activeLink.hasPassword && (
              <span className="inline-flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                Password protected
              </span>
            )}
            {activeLink.expiresAt && (
              <span>
                Expires {new Date(activeLink.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Include sub-pages</span>
            <Switch
              checked={activeLink.includeChildren}
              disabled={updateLinkMutation.isPending}
              onCheckedChange={(checked) =>
                updateLinkMutation.mutate({
                  id: pageId,
                  linkId: activeLink.id,
                  patch: { includeChildren: checked },
                })
              }
            />
          </label>

          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Allow search engines</span>
            <Switch
              checked={activeLink.allowIndexing}
              disabled={updateLinkMutation.isPending}
              onCheckedChange={(checked) =>
                updateLinkMutation.mutate({
                  id: pageId,
                  linkId: activeLink.id,
                  patch: { allowIndexing: checked },
                })
              }
            />
          </label>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => setConfirming({ kind: "rotate", link: activeLink })}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              New link
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-1.5 text-destructive"
              onClick={() => setConfirming({ kind: "revoke", link: activeLink })}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Unpublish
            </Button>
          </div>
        </>
      )}

      {/* Both actions break a URL that other people may already hold, so neither
          happens on a single click. */}
      <AlertDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirming?.kind === "rotate"
                ? "Generate a new link?"
                : "Stop publishing this note?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirming?.kind === "rotate"
                ? "The current URL stops working immediately. Anyone you already sent it to will need the new one."
                : "The URL stops working immediately for everyone who has it. This cannot be undone — publishing again creates a different link."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {confirming?.kind === "rotate" ? "Generate" : "Unpublish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
