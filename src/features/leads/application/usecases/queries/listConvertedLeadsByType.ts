import type { Lead, LeadType } from "@/leads/domain";
import type { LeadsAppContext } from "@/leads";
import { sortByStartDateDesc } from "@/leads/domain";

export async function listConvertedLeadsByType(
  ctx: LeadsAppContext,
  type: LeadType,
): Promise<Lead[]> {
  const leads = await ctx.repos.lead.findConvertedByType(type);
  return sortByStartDateDesc(leads);
}
