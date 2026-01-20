import type { Lead } from "@/leads/domain";
import type { LeadsAppContext } from "@/leads";
import { sortByStartDateDesc } from "@/leads/domain";

export type ListLeadsInReviewOptions = Readonly<{
  sort?: "startDateDesc" | "none";
}>;

export async function listLeadsInReview(
  ctx: LeadsAppContext,
  options: ListLeadsInReviewOptions = { sort: "startDateDesc" }
): Promise<Lead[]> {
  const leads = await ctx.repos.lead.findInReview();

  const sort = options?.sort ?? "startDateDesc";
  if (sort === "startDateDesc") {
    return sortByStartDateDesc(leads);
  }
  return Array.isArray(leads) ? [...leads] : [];
}
