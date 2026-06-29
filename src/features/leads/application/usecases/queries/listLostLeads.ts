import type { Lead } from "@/leads/domain";
import type { LeadsAppContext } from "@/leads";
import { sortByStartDateDesc } from "@/leads/domain";

export type ListLostLeadsOptions = Readonly<{
  sort?: "startDateDesc" | "none";
}>;

/**
 * Devuelve todos los leads perdidos (status = LOST) de todas las categorías.
 * Estos leads se muestran en su propia página dedicada y se ocultan de las
 * páginas de leads por categoría.
 */
export async function listLostLeads(
  ctx: LeadsAppContext,
  options: ListLostLeadsOptions = { sort: "startDateDesc" }
): Promise<Lead[]> {
  const leads = await ctx.repos.lead.findLost();

  const sort = options?.sort ?? "startDateDesc";
  if (sort === "startDateDesc") {
    return sortByStartDateDesc(leads);
  }
  return Array.isArray(leads) ? [...leads] : [];
}
