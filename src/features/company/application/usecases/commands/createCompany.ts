import type { Company, CompanyDraft, CompanyPolicies } from "@/company";
import type { CompaniesAppContext } from "../../context";

export async function createCompany(
  ctx: CompaniesAppContext,
  draft: CompanyDraft,
  _policies: CompanyPolicies = {}
): Promise<Company> {
  return ctx.repos.company.create(draft);
}
