import type { ContactsAppContext, Contact, ContactPatch } from "@/contact";

export async function patchContact(
  ctx: ContactsAppContext,
  contactId: number,
  patch: ContactPatch
): Promise<Contact> {
  if (Object.keys(patch).length === 0) {
    const current = await ctx.repos.contact.getById(contactId);
    if (!current) {
      throw new Error(`Contact ${contactId} not found`);
    }
    return current;
  }

  return ctx.repos.contact.update(contactId, patch);
}
