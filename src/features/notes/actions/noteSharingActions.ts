"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { NoteSharingHttpRepository } from "@/notes";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";
import type {
  NoteAccessPanel,
  NoteAdminLink,
  NoteDirectoryUser,
  NoteLinkDraft,
  NoteLinkPatch,
  NoteLinkStats,
  NotePage,
  NotePageSummary,
  NoteShareAccess,
  NoteShareLink,
  NoteVisibility,
} from "@/notes/domain";

/**
 * Same shape — and the same trap — as noteActions.ts: the plain `serverApiClient`
 * singleton carries no request context and forwards no cookie, so every call through it
 * comes back 401 no matter what the browser's session is.
 */
async function sharingRepo() {
  return new NoteSharingHttpRepository(createServerApiClient(await headers()));
}

export async function listSharedWithMeAction(): Promise<
  ActionResult<NotePageSummary[]>
> {
  try {
    return success(await (await sharingRepo()).listSharedWithMe());
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getNoteAccessAction(
  id: number
): Promise<ActionResult<NoteAccessPanel>> {
  try {
    return success(await (await sharingRepo()).getAccessPanel(id));
  } catch (error) {
    return handleActionError(error);
  }
}

export async function setNoteVisibilityAction(
  id: number,
  visibility: NoteVisibility
): Promise<ActionResult<NotePage>> {
  try {
    return success(await (await sharingRepo()).setVisibility(id, visibility));
  } catch (error) {
    return handleActionError(error);
  }
}

export async function shareNoteWithUserAction(
  id: number,
  userId: number,
  access: NoteShareAccess,
  expiresAt?: string
): Promise<ActionResult<NoteAccessPanel>> {
  try {
    const repo = await sharingRepo();
    return success(
      await repo.addShare(id, {
        subjectType: "user",
        subjectId: userId,
        access,
        expiresAt,
      })
    );
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateNoteShareAction(
  id: number,
  shareId: number,
  patch: { access?: NoteShareAccess; expiresAt?: string | null }
): Promise<ActionResult<NoteAccessPanel>> {
  try {
    return success(await (await sharingRepo()).updateShare(id, shareId, patch));
  } catch (error) {
    return handleActionError(error);
  }
}

export async function revokeNoteShareAction(
  id: number,
  shareId: number
): Promise<ActionResult<void>> {
  try {
    await (await sharingRepo()).removeShare(id, shareId);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * The returned link carries `url`, and only here. The server keeps a SHA-256 of the
 * token, so the caller must surface it immediately — there is no second chance to read
 * it, only rotation.
 */
export async function publishNoteLinkAction(
  id: number,
  draft: NoteLinkDraft
): Promise<ActionResult<NoteShareLink>> {
  try {
    return success(await (await sharingRepo()).createLink(id, draft));
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateNoteLinkAction(
  id: number,
  linkId: number,
  patch: NoteLinkPatch
): Promise<ActionResult<NoteShareLink>> {
  try {
    return success(await (await sharingRepo()).updateLink(id, linkId, patch));
  } catch (error) {
    return handleActionError(error);
  }
}

export async function rotateNoteLinkAction(
  id: number,
  linkId: number
): Promise<ActionResult<NoteShareLink>> {
  try {
    return success(await (await sharingRepo()).rotateLink(id, linkId));
  } catch (error) {
    return handleActionError(error);
  }
}

export async function unpublishNoteLinkAction(
  id: number,
  linkId: number
): Promise<ActionResult<void>> {
  try {
    await (await sharingRepo()).revokeLink(id, linkId);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getNoteLinkStatsAction(
  id: number,
  linkId: number
): Promise<ActionResult<NoteLinkStats>> {
  try {
    return success(await (await sharingRepo()).getLinkStats(id, linkId));
  } catch (error) {
    return handleActionError(error);
  }
}

export async function listNoteDirectoryAction(): Promise<
  ActionResult<NoteDirectoryUser[]>
> {
  try {
    return success(await (await sharingRepo()).listDirectory());
  } catch (error) {
    return handleActionError(error);
  }
}

export async function listAllNoteLinksAction(): Promise<ActionResult<NoteAdminLink[]>> {
  try {
    return success(await (await sharingRepo()).listAllLinks());
  } catch (error) {
    return handleActionError(error);
  }
}

export async function adminRevokeNoteLinkAction(linkId: number): Promise<ActionResult<void>> {
  try {
    await (await sharingRepo()).adminRevokeLink(linkId);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}
