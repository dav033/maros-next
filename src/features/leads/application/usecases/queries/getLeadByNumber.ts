import type { Lead } from "@/leads/domain";
import type { LeadsAppContext } from "@/leads";
import { BusinessRuleError } from "@/shared/domain";

export async function getLeadByNumber(
  ctx: LeadsAppContext,
  leadNumber: string
): Promise<Lead> {
  const lead = await ctx.repos.lead.getByLeadNumber(leadNumber);
  if (!lead) {
    throw new BusinessRuleError("NOT_FOUND", `Lead with number ${leadNumber} not found`, {
      details: { leadNumber },
    });
  }
  return lead;
}






