import type { Company, CompanyId, CompanyPatch } from "@/company";
import type { CompanyPatchPolicies } from "@/company";
import type { CompanyAppContext } from "../../context";

export async function patchCompany(
  ctx: CompanyAppContext,
  id: CompanyId,
  patch: CompanyPatch,
  _policies: CompanyPatchPolicies = {}
): Promise<Company> {
  return ctx.repos.company.update(id, patch);
}
