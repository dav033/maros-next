import type { Lead } from "@/leads/domain";
import type { LeadsAppContext } from "@/leads";

/**
 * Every lead, across types and statuses — for pickers that let you search the whole
 * pipeline. The by-type lists are the ones the lead pages use; this one deliberately
 * keeps LOST leads in, because an old note can legitimately belong to one.
 */
export async function listLeads(ctx: LeadsAppContext): Promise<Lead[]> {
  const leads = await ctx.repos.lead.list();
  return Array.isArray(leads) ? leads : [];
}
