import type { LeadsAppContext } from "@/leads/application";
import { ensureLeadNumberAvailable } from "@/leads/domain";

export async function validateLeadNumberAvailability(
  ctx: LeadsAppContext,
  leadNumber: string
): Promise<void> {
  await ensureLeadNumberAvailable(leadNumber, async (n) => {
    const available = await ctx.services.leadNumberAvailability.isAvailable(n);
    return !available;
  });
}
