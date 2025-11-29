import type { Company, CompanyDraft } from "@/company";
import type { CompanyPolicies } from "@/features/company/domain/types";
import type { CompanyAppContext } from "../../context";

export async function createCompany(
  ctx: CompanyAppContext,
  draft: CompanyDraft,
  _policies: CompanyPolicies = {}
): Promise<Company> {
  return ctx.repos.company.create(draft);
}
