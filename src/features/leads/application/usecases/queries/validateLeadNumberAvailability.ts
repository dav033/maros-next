import type { LeadsAppContext } from "@/leads";
import { ensureLeadNumberAvailable } from "@/leads";

export async function validateLeadNumberAvailability(
  ctx: LeadsAppContext,
  leadNumber: string
): Promise<void> {
  await ensureLeadNumberAvailable(leadNumber, async (n) => {
    const available = await ctx.services.leadNumberAvailability.isAvailable(n);
    return !available;
  });
}
