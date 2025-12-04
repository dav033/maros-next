import type { Lead, LeadType } from "@/leads/domain";
import type { LeadsAppContext } from "@/leads";

export async function fetchLeadsByType(
  ctx: LeadsAppContext,
  type: LeadType
): Promise<Lead[]> {
  return ctx.repos.lead.findByType(type);
}
