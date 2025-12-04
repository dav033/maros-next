import type { Lead, LeadStatus, LeadType } from "@/leads/domain";
import type { LeadsAppContext } from "@/leads";
import { filterByStatus, sortByStartDateDesc } from "@/leads/domain";

export type ListLeadsByTypeAndStatusOptions = Readonly<{
  sort?: "startDateDesc" | "none";
}>;

export async function listLeadsByTypeAndStatus(
  ctx: LeadsAppContext,
  type: LeadType,
  status: LeadStatus,
  options: ListLeadsByTypeAndStatusOptions = { sort: "startDateDesc" }
): Promise<Lead[]> {
  const all = await ctx.repos.lead.findByType(type);
  const filtered = filterByStatus(all, status);

  const sort = options?.sort ?? "startDateDesc";
  if (sort === "startDateDesc") {
    return sortByStartDateDesc(filtered);
  }
  return filtered;
}
