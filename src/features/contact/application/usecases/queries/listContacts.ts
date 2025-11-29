import type { Contact } from "@/contact";
import type { ContactsAppContext } from "@/contact";

export async function listContacts(ctx: ContactsAppContext): Promise<Contact[]> {
  return ctx.repos.contact.list();
}
