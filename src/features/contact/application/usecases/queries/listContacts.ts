import type { Contact } from "@/contact/domain";
import type { ContactsAppContext } from "@/contact/application";

export async function listContacts(ctx: ContactsAppContext): Promise<Contact[]> {
  return ctx.repos.contact.list();
}
