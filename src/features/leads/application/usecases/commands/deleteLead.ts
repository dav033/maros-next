import type { LeadId } from "@/leads";
import type { LeadsAppContext } from "../../context";

export async function deleteLead(
  ctx: LeadsAppContext,
  id: LeadId
): Promise<void> {
  await ctx.repos.lead.delete(id);
}
