import type {
  Lead,
  LeadPatch,
    LeadPolicies,
  LeadsAppContext,
} from "@/leads";
import { applyLeadPatch, diffToPatch, getLeadById } from "@/leads";

export async function patchLead(
  ctx: LeadsAppContext,
  id: number,
  patch: LeadPatch,
    policies: LeadPolicies = {}
): Promise<Lead> {
  try {
    const current = await getLeadById(ctx, Number(id));

    const { lead: updated } = applyLeadPatch(ctx.clock, current, patch, policies);

    const normalizedPatch = diffToPatch(current, updated);

    const result = await ctx.repos.lead.update(Number(id), normalizedPatch);

    return result;
  } catch (error) {
    console.error('patchLead - ERROR:', error);
    throw error;
  }
}
