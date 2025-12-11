import type { ContactsAppContext } from "@/contact";
import { makeContactsAppContext, ContactHttpRepository } from "@/contact";


export function createContactsAppContext(): ContactsAppContext {
  const contactHttpRepo = new ContactHttpRepository();
  
  return makeContactsAppContext({
    repos: {
      contact: contactHttpRepo,
    },
  });
}
