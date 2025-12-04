import type { Lead, LeadId } from "@/leads/domain";
import type { LeadsAppContext } from "@/leads";
import { BusinessRuleError } from "@/shared/domain";

export async function getLeadById(
  ctx: LeadsAppContext,
  id: LeadId
): Promise<Lead> {
  const lead = await ctx.repos.lead.getById(id);
  if (!lead) {
    throw new BusinessRuleError("NOT_FOUND", `Lead ${id} not found`, {
      details: { id },
    });
  }
  return lead;
}
