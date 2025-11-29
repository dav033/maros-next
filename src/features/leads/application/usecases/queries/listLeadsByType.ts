import type { Lead, LeadsAppContext, LeadType } from "@/leads";
import { sortByStartDateDesc } from "@/leads";

export type ListLeadsByTypeOptions = Readonly<{
  sort?: "startDateDesc" | "none";
}>;

export async function listLeadsByType(
  ctx: LeadsAppContext,
  type: LeadType,
  options: ListLeadsByTypeOptions = { sort: "startDateDesc" }
): Promise<Lead[]> {
  const leads = await ctx.repos.lead.findByType(type);

  const sort = options?.sort ?? "startDateDesc";
  if (sort === "startDateDesc") {
    return sortByStartDateDesc(leads);
  }
  return Array.isArray(leads) ? [...leads] : [];
}
