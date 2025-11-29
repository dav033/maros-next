import type { ContactsAppContext, Contact, ContactDraft } from "@/contact";

export async function createContact(
  ctx: ContactsAppContext,
  draft: ContactDraft
): Promise<Contact> {
  return ctx.repos.contact.create(draft);
}
