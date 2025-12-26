"use server";

import { serverApiClient } from "@/shared/infra/http";
import { ContactHttpRepository, makeContactsAppContext } from "@/contact";
import { patchContact, deleteContact } from "@/contact/application";
import type { Contact, ContactPatch } from "@/contact/domain";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";

// Create server-side app context
function createServerContactsAppContext() {
  return makeContactsAppContext({
    repos: {
      contact: new ContactHttpRepository(serverApiClient),
    },
  });
}

export async function updateContactAction(
  id: number,
  patch: ContactPatch
): Promise<ActionResult<Contact>> {
  try {
    const ctx = createServerContactsAppContext();
    const updated = await patchContact(ctx, id, patch);
    return success(updated);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteContactAction(id: number): Promise<ActionResult<void>> {
  try {
    const ctx = createServerContactsAppContext();
    await deleteContact(ctx, id);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}



