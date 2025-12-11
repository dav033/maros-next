import type { Contact } from "@/contact/domain";
import type { ContactsAppContext } from "@/contact/application";

export async function getContactsByCompany(
  ctx: ContactsAppContext,
  companyId: number
): Promise<Contact[]> {
  if (!ctx.repos.contact.listByCompany) return [];
  return ctx.repos.contact.listByCompany(companyId);
}


