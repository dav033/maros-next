import type { CompanyId } from "@/company";
import type { CompaniesAppContext } from "../../context";

export async function deleteCompany(
  ctx: CompaniesAppContext,
  id: CompanyId
): Promise<void> {
  await ctx.repos.company.delete(id);
}
