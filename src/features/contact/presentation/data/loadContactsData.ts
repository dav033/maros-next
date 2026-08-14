import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { ContactHttpRepository, makeContactsAppContext } from "@/contact";
import { listContacts } from "@/contact/application";
import type { Contact } from "@/contact/domain";

export interface ContactsPageData {
  contacts: Contact[];
}

/**
 * Not wrapped in `unstable_cache` any more: the backend requires the session cookie,
 * and `headers()` cannot be read inside a cached function. The previous version used
 * the cookieless `serverApiClient` singleton, so every call 401'd, and the
 * `.catch(() => [])` below turned that into an empty list that then got cached and
 * served to everyone for the next minute.
 */
export async function loadContactsData(): Promise<ContactsPageData> {
  const apiClient = createServerApiClient(await headers());
  const ctx = makeContactsAppContext({
    repos: {
      contact: new ContactHttpRepository(apiClient),
    },
  });

  const contacts = await listContacts(ctx).catch(() => []);

  return {
    contacts: contacts ?? [],
  };
}
