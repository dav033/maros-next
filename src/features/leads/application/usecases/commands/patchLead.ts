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
  console.log('patchLead - START - ID:', id, 'Patch:', patch);
  
  try {
    const current = await getLeadById(ctx, Number(id));
    console.log('patchLead - Current lead loaded:', current.id);

    const { lead: updated } = applyLeadPatch(ctx.clock, current, patch, policies);

    const normalizedPatch = diffToPatch(current, updated);
    console.log('patchLead - Normalized patch:', normalizedPatch);

    console.log('patchLead - Calling ctx.repos.lead.update');
    console.log('[FRONT] Ejecutando ctx.repos.lead.update con:', Number(id), normalizedPatch);
    const result = await ctx.repos.lead.update(Number(id), normalizedPatch);

    console.log('patchLead - Update successful');
    return result;
  } catch (error) {
    console.error('patchLead - ERROR:', error);
    throw error;
  }
}
