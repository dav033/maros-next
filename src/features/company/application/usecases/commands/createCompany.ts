import type { Company, CompanyDraft, CompanyPolicies } from "@/company";
import type { CompanyAppContext } from "../../context";

export async function createCompany(
  ctx: CompanyAppContext,
  draft: CompanyDraft,
  _policies: CompanyPolicies = {}
): Promise<Company> {
  return ctx.repos.company.create(draft);
}
