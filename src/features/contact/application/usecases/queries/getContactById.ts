import type { Contact } from "@/contact";
import type { ContactsAppContext } from "@/contact";
import { BusinessRuleError } from "@/shared";

export async function getContactById(
  ctx: ContactsAppContext,
  id: number
): Promise<Contact> {
  const contact = await ctx.repos.contact.getById(id);
  if (!contact) {
    throw new BusinessRuleError("NOT_FOUND", "Contact not found", {
      details: { id },
    });
  }
  return contact;
}
