import { optimizedApiClient } from "@/shared/infra";
import { queryClient } from "@/shared/lib/queryClient";
import { notesKeys } from "@/notes/application";
import { endpoints as noteEndpoints } from "@/features/notes/infra/http/endpoints";
import type { NoteReferenceKind, NoteReferenceTarget } from "@/notes/domain";

/**
 * Looks up referenceable records for a Suggestion menu.
 *
 * Not routed through the DI context and its usecases, for the reason taskMentionExtension
 * and useNoteLinkableRecords both give: a Suggestion's `items()` callback runs outside
 * React, with no provider to pull the app context from. It does go through the shared
 * queryClient, so the same `@j` typed twice in a row is one request, and the result is
 * already warm if the relations picker asked for it a moment ago.
 *
 * Failures resolve to an empty list rather than throwing: the menu is a suggestion, and an
 * unhandled rejection inside a ProseMirror plugin takes the editor with it.
 */
export async function searchReferenceTargets(
  query: string,
  kinds: NoteReferenceKind[],
  perKind: number
): Promise<NoteReferenceTarget[]> {
  try {
    return await queryClient.fetchQuery({
      queryKey: notesKeys.referenceTargets(query, kinds),
      queryFn: async () => {
        const { data } = await optimizedApiClient.get<NoteReferenceTarget[]>(
          noteEndpoints.referenceTargets(),
          {
            params: {
              q: query,
              perKind,
              ...(kinds.length > 0 ? { kinds: kinds.join(",") } : {}),
            },
          }
        );
        return Array.isArray(data) ? data : [];
      },
      // Long enough that arrowing through a menu never refetches, short enough that a
      // lead created in another tab shows up without a reload.
      staleTime: 60_000,
    });
  } catch {
    return [];
  }
}
