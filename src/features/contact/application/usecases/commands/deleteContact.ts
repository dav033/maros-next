import type { ContactsAppContext } from "../../../application/context";

export async function deleteContact(ctx: ContactsAppContext, id: number): Promise<void> {
  await ctx.repos.contact.delete(id);
}
