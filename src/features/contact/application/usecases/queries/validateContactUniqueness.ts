import type { ContactUniquenessCheck } from "@/contact/domain";
import type { ContactsAppContext } from "../../../application/context";
import { findDuplicate } from "../../../domain/services";

export async function validateContactUniqueness(
  ctx: ContactsAppContext,
  candidate: ContactUniquenessCheck
): Promise<{ duplicate: boolean; conflictId?: number }> {
  if (ctx.ports?.uniqueness) {
    return ctx.ports.uniqueness.isDuplicate(candidate);
  }
  const all = await ctx.repos.contact.list();
  const match = findDuplicate(all, candidate, {});
  if (!match) return { duplicate: false };
  return { duplicate: true, conflictId: match.id };
}
