import type {
  Lead,
  LeadPatch,
    LeadPolicies,
} from "@/leads/domain";
import type { LeadsAppContext } from "@/leads";
import { applyLeadPatch, diffToPatch } from "@/leads/domain";
import { getLeadById } from "../queries/getLeadById";

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
