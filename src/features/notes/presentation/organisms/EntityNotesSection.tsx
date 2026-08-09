"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, NotebookPen, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInstantNotesByEntity } from "../hooks/data/useInstantNotesByEntity";
import { useNoteMutations } from "../hooks/mutations/useNoteMutations";
import type { NoteEntityKind } from "@/notes/domain";

export function EntityNotesSection({
  entityKind,
  entityId,
  defaultTitle,
}: {
  entityKind: NoteEntityKind;
  entityId: number;
  /** Seeds the title of a newly created note, e.g. the lead or project name. */
  defaultTitle?: string;
}) {
  const router = useRouter();
  const { pages, isLoading } = useInstantNotesByEntity(entityKind, entityId);
  const { createMutation } = useNoteMutations();

  const handleCreate = async () => {
    try {
      const page = await createMutation.mutateAsync({
        title: defaultTitle || "Untitled",
        entityKind,
        entityId,
      });
      router.push(`/notes/${page.id}`);
    } catch {
      // handled by useEntityMutation's onError (toast / session redirect)
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <NotebookPen className="h-4 w-4" />
          Notes
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleCreate}>
          <Plus className="mr-1 h-4 w-4" />
          New note
        </Button>
      </CardHeader>
      <CardContent>
        {!isLoading && pages.length === 0 && (
          <p className="text-sm text-muted-foreground">No notes linked yet.</p>
        )}
        <div className="space-y-1">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/notes/${page.id}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50"
            >
              <span className="shrink-0">
                {page.icon ?? <FileText className="h-4 w-4 text-muted-foreground" />}
              </span>
              <span className="truncate">{page.title || "Untitled"}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
