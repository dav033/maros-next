"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { ContactHttpRepository, makeContactsAppContext } from "@/contact";
import { patchContact, deleteContact } from "@/contact/application";
import type { Contact, ContactPatch } from "@/contact/domain";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";

// Create server-side app context
async function createServerContactsAppContext() {
  const apiClient = createServerApiClient(await headers());
  return makeContactsAppContext({
    repos: {
      contact: new ContactHttpRepository(apiClient),
    },
  });
}

export async function updateContactAction(
  id: number,
  patch: ContactPatch
): Promise<ActionResult<Contact>> {
  try {
    const ctx = await createServerContactsAppContext();
    const updated = await patchContact(ctx, id, patch);
    return success(updated);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteContactAction(id: number): Promise<ActionResult<void>> {
  try {
    const ctx = await createServerContactsAppContext();
    await deleteContact(ctx, id);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}



