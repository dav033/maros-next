import type { Lead, LeadType } from "@/leads/domain";
import type { LeadsAppContext } from "@/leads";
import { sortByStartDateDesc, LeadStatus } from "@/leads/domain";

export type ListLeadsByTypeOptions = Readonly<{
  sort?: "startDateDesc" | "none";
}>;

export async function listLeadsByType(
  ctx: LeadsAppContext,
  type: LeadType,
  options: ListLeadsByTypeOptions = { sort: "startDateDesc" }
): Promise<Lead[]> {
  const all = await ctx.repos.lead.findByType(type);
  // Los leads perdidos (LOST) viven en su propia página dedicada y no
  // deben aparecer en las páginas de leads por categoría.
  const leads = all.filter((lead) => lead.status !== LeadStatus.LOST);

  const sort = options?.sort ?? "startDateDesc";
  if (sort === "startDateDesc") {
    return sortByStartDateDesc(leads);
  }
  return Array.isArray(leads) ? [...leads] : [];
}
