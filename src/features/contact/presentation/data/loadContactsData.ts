import { unstable_cache } from "next/cache";
import { serverApiClient } from "@/shared/infra/http";
import { ContactHttpRepository, makeContactsAppContext } from "@/contact";
import { listContacts } from "@/contact/application";
import type { Contact } from "@/contact/domain";

export interface ContactsPageData {
  contacts: Contact[];
}

async function fetchContactsData(): Promise<ContactsPageData> {
  const ctx = makeContactsAppContext({
    repos: {
      contact: new ContactHttpRepository(serverApiClient),
    },
  });

  const contacts = await listContacts(ctx).catch(() => []);

  return {
    contacts: contacts ?? [],
  };
}

export const loadContactsData = unstable_cache(
  fetchContactsData,
  ["contacts-page-data"],
  { revalidate: 60 }
);
