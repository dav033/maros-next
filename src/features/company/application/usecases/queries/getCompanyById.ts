import type { Company, CompanyId } from "@/company";
import type { CompaniesAppContext } from "../../context";

export async function getCompanyById(
  ctx: CompaniesAppContext,
  id: CompanyId
): Promise<Company> {
  const company = await ctx.repos.company.getById(id);
  if (!company) {
    throw new Error(`Company ${id} not found`);
  }
  return company;
}
