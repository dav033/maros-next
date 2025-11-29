import type { Lead, LeadsAppContext, LeadType } from "@/leads";

export async function fetchLeadsByType(
  ctx: LeadsAppContext,
  type: LeadType
): Promise<Lead[]> {
  return ctx.repos.lead.findByType(type);
}
