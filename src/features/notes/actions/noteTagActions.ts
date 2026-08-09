"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { NoteTagHttpRepository } from "@/notes";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";
import type { NoteTag } from "@/notes/domain";

async function repo() {
  return new NoteTagHttpRepository(createServerApiClient(await headers()));
}

export async function createNoteTagAction(
  name: string,
  color?: string
): Promise<ActionResult<NoteTag>> {
  try {
    return success(await (await repo()).create(name, color));
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateNoteTagAction(
  id: number,
  patch: { name?: string; color?: string }
): Promise<ActionResult<NoteTag>> {
  try {
    return success(await (await repo()).update(id, patch));
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteNoteTagAction(id: number): Promise<ActionResult<void>> {
  try {
    await (await repo()).delete(id);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}
