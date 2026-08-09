"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { NotePageHttpRepository, NoteTagHttpRepository, makeNotesAppContext } from "@/notes";
import { SystemClock } from "@/shared/domain";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";
import type {
  NoteEntityLink,
  NoteMoveResult,
  NotePage,
  NotePageDraft,
  NotePagePatch,
  NotePageSummary,
} from "@/notes/domain";

// The plain `serverApiClient` singleton has no request context and forwards
// no auth — every call through it hit the backend unauthenticated and came
// back 401 "session expired" regardless of the browser's real session.
// createServerApiClient forwards this request's Cookie header instead.
async function createServerNotesAppContext() {
  const api = createServerApiClient(await headers());
  return makeNotesAppContext({
    clock: SystemClock,
    repos: {
      notePage: new NotePageHttpRepository(api),
      noteTag: new NoteTagHttpRepository(api),
    },
  });
}

export async function createNotePageAction(
  draft: NotePageDraft
): Promise<ActionResult<NotePage>> {
  try {
    const ctx = await createServerNotesAppContext();
    const page = await ctx.repos.notePage.create(draft);
    return success(page);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateNotePageMetaAction(
  id: number,
  patch: NotePagePatch
): Promise<ActionResult<NotePage>> {
  try {
    const ctx = await createServerNotesAppContext();
    const page = await ctx.repos.notePage.update(id, patch);
    return success(page);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveNoteContentAction(
  id: number,
  content: Record<string, unknown>,
  expectedUpdatedAt?: string
): Promise<ActionResult<NotePage>> {
  try {
    const ctx = await createServerNotesAppContext();
    const page = await ctx.repos.notePage.updateContent(id, content, expectedUpdatedAt);
    return success(page);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function moveNotePageAction(
  id: number,
  parentId: number | null,
  beforeId?: number | null,
  afterId?: number | null
): Promise<ActionResult<NoteMoveResult>> {
  try {
    const ctx = await createServerNotesAppContext();
    const result = await ctx.repos.notePage.move(id, parentId, beforeId, afterId);
    return success(result);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function trashNotePageAction(id: number): Promise<ActionResult<void>> {
  try {
    const ctx = await createServerNotesAppContext();
    await ctx.repos.notePage.trash(id);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function restoreNotePageAction(id: number): Promise<ActionResult<NotePage>> {
  try {
    const ctx = await createServerNotesAppContext();
    const page = await ctx.repos.notePage.restore(id);
    return success(page);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function purgeNotePageAction(id: number): Promise<ActionResult<void>> {
  try {
    const ctx = await createServerNotesAppContext();
    await ctx.repos.notePage.purge(id);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function setNoteFavoriteAction(
  id: number,
  isFavorite: boolean
): Promise<ActionResult<NotePageSummary>> {
  try {
    const ctx = await createServerNotesAppContext();
    const page = await ctx.repos.notePage.setFavorite(id, isFavorite);
    return success(page);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function setNoteEntityLinkAction(
  id: number,
  link: NoteEntityLink
): Promise<ActionResult<NotePageSummary>> {
  try {
    const ctx = await createServerNotesAppContext();
    const page = await ctx.repos.notePage.setEntityLink(id, link);
    return success(page);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function setNotePageTagsAction(
  id: number,
  tagIds: number[]
): Promise<ActionResult<NotePageSummary>> {
  try {
    const ctx = await createServerNotesAppContext();
    const page = await ctx.repos.notePage.setTags(id, tagIds);
    return success(page);
  } catch (error) {
    return handleActionError(error);
  }
}
