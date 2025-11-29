import type { Company, CompanyId, CompanyPatch, CompanyPatchPolicies } from "@/company";
import type { CompaniesAppContext } from "../../context";

export async function patchCompany(
  ctx: CompaniesAppContext,
  id: CompanyId,
  patch: CompanyPatch,
  _policies: CompanyPatchPolicies = {}
): Promise<Company> {
  return ctx.repos.company.update(id, patch);
}
