import type { CompanyId } from "@/company";
import type { CompanyAppContext } from "../../context";

export async function deleteCompany(
  ctx: CompanyAppContext,
  id: CompanyId
): Promise<void> {
  await ctx.repos.company.delete(id);
}
