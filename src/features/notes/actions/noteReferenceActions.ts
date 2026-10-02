"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { NoteReferenceHttpRepository } from "@/notes";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";
import type { NoteReference, NoteReferenceKind } from "@/notes/domain";

async function repo() {
  return new NoteReferenceHttpRepository(createServerApiClient(await headers()));
}

/** Pins a record to the note header. Returns the full set, so the bar re-renders from truth. */
export async function addNoteRelationAction(
  pageId: number,
  kind: NoteReferenceKind,
  targetId: number
): Promise<ActionResult<NoteReference[]>> {
  try {
    return success(await (await repo()).addRelation(pageId, kind, targetId));
  } catch (error) {
    return handleActionError(error);
  }
}

export async function removeNoteRelationAction(
  pageId: number,
  kind: NoteReferenceKind,
  targetId: number
): Promise<ActionResult<void>> {
  try {
    await (await repo()).removeRelation(pageId, kind, targetId);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}
