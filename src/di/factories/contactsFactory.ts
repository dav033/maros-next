import type { ContactsAppContext } from "@/contact";
import { makeContactsAppContext, ContactHttpRepository } from "@/contact";

/**
 * Factory for creating the Contacts application context.
 * Encapsulates all contact-related dependencies.
 */
export function createContactsAppContext(): ContactsAppContext {
  const contactHttpRepo = new ContactHttpRepository();
  
  return makeContactsAppContext({
    repos: {
      contact: contactHttpRepo,
    },
  });
}
