import type { Company, CompanyId } from "@/company";
import type { CompanyAppContext } from "../../context";

export async function getCompanyById(
  ctx: CompanyAppContext,
  id: CompanyId
): Promise<Company | undefined> {
  const company = await ctx.repos.company.getById(id);
  return company === null ? undefined : company;
}
