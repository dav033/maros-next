"use client";

import { useRef, useState } from "react";
import { RotateCcw, Trash, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstantTrashNotes } from "../hooks/data/useInstantTrashNotes";
import { useInstantNoteTree } from "../hooks/data/useInstantNoteTree";
import { useNoteMutations } from "../hooks/mutations/useNoteMutations";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import { NoteCollectionShell } from "./NoteCollectionShell";
import { NoteListRow } from "../molecules/NoteListRow";
import { resolveNoteAncestors } from "@/notes/domain";

type PendingPurge =
  | { kind: "note"; id: number; title: string }
  | { kind: "all"; ids: number[] }
  | null;

export function NoteTrashPageView() {
  const [pendingPurge, setPendingPurge] = useState<PendingPurge>(null);
  const [isPurging, setIsPurging] = useState(false);
  const focusMainAfterPurge = useRef(false);
  const { pages, isLoading } = useInstantTrashNotes();
  const { pages: allPages } = useInstantNoteTree();
  const { restoreMutation, purgeMutation } = useNoteMutations();

  const handlePurge = (id: number, title: string) => {
    setPendingPurge({ kind: "note", id, title: title || "Untitled" });
  };

  const handleEmptyTrash = () => {
    if (pages.length === 0) return;
    setPendingPurge({ kind: "all", ids: pages.map((page) => page.id) });
  };

  const confirmPurge = async () => {
    if (!pendingPurge || isPurging) return;
    setIsPurging(true);
    try {
      if (pendingPurge.kind === "note") {
        await purgeMutation.mutateAsync(pendingPurge.id);
      } else {
        const results = await Promise.all(
          pendingPurge.ids.map(async (id) => {
            try {
              await purgeMutation.mutateAsync(id);
              return { id, succeeded: true };
            } catch {
              return { id, succeeded: false };
            }
          }),
        );
        const failedIds = results.filter((result) => !result.succeeded).map((result) => result.id);
        if (failedIds.length > 0) {
          setPendingPurge({ kind: "all", ids: failedIds });
          return;
        }
      }
      focusMainAfterPurge.current = true;
      setPendingPurge(null);
    } catch {
      // The mutation hook reports the server error; keep the confirmation open for retry.
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <>
      <NoteCollectionShell
      icon={<Trash className="size-4 text-muted-foreground" />}
      title="Trash"
      description="Pages are permanently deleted after 30 days."
      count={isLoading ? null : pages.length}
      isEmpty={!isLoading && pages.length === 0}
      emptyTitle="Trash is empty"
      emptyBody="Pages you move to the trash wait here for 30 days before they are gone for good."
      action={
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-destructive/40 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={pages.length === 0}
          onClick={handleEmptyTrash}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Empty trash
        </Button>
      }
      >
        {isLoading
        ? [1, 2, 3].map((row) => (
            <li key={row} className="px-2.5 py-2">
              <Skeleton className="h-5 w-full" />
            </li>
          ))
        : pages.map((page) => {
            const parentLabel = resolveNoteAncestors(allPages, page.id)[0]
              ?.title;
            return (
              <NoteListRow
                key={page.id}
                kind={page.kind}
                icon={page.icon || undefined}
                title={page.title}
                muted
                context={`${parentLabel ? `${parentLabel} · ` : ""}Deleted ${formatRelativeTime(page.deletedAt ?? page.updatedAt)}`}
                actions={
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={() => restoreMutation.mutate(page.id)}
                    >
                      <RotateCcw className="size-3.5" aria-hidden="true" />
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 hover:bg-destructive/15 hover:text-destructive"
                      title="Delete permanently"
                      aria-label={`Permanently delete ${page.title || "Untitled"}`}
                      onClick={() => handlePurge(page.id, page.title)}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </Button>
                  </>
                }
              />
            );
          })}
      </NoteCollectionShell>
      <AlertDialog
        open={pendingPurge !== null}
        onOpenChange={(open) => {
          if (!open && !isPurging) setPendingPurge(null);
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            if (!focusMainAfterPurge.current) return;
            focusMainAfterPurge.current = false;
            const appMain = document.querySelector<HTMLElement>("[data-app-route-scroll]");
            if (!appMain || appMain.closest("[inert]")) return;
            event.preventDefault();
            appMain.focus({ preventScroll: true });
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingPurge?.kind === "all" ? "Empty trash permanently?" : "Delete this page permanently?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingPurge?.kind === "all"
                ? `This will permanently delete ${pendingPurge.ids.length} item${pendingPurge.ids.length === 1 ? "" : "s"}. This cannot be undone.`
                : `“${pendingPurge?.title ?? "Untitled"}” will be permanently deleted. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPurging}>Keep in trash</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPurging}
              onClick={(event) => {
                event.preventDefault();
                void confirmPurge();
              }}
            >
              {isPurging ? "Deleting…" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
