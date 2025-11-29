import type { LeadStatusCount, LeadType } from "@/leads";
import type { LeadsAppContext } from "../../context";
import { summarizeLeadsByType as summarizeLeadsByTypeDomain } from "../../../domain/services/leadStatusSummary";

export async function summarizeLeadsByTypeQuery(
  ctx: LeadsAppContext,
  type: LeadType
): Promise<Readonly<{ totalLeads: number; byStatus: LeadStatusCount }>> {
  const leads = await ctx.repos.lead.findByType(type);
  return summarizeLeadsByTypeDomain(leads, type);
}
