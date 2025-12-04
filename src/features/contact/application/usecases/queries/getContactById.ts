import type { Contact } from "@/contact/domain";
import type { ContactsAppContext } from "@/contact/application";
import { BusinessRuleError } from "@/shared/domain";

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
