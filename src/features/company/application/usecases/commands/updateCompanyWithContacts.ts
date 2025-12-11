import type { Company, CompanyPatch } from "@/company";
import type { CompanyAppContext } from "../../context";

export type UpdateCompanyWithContactsInput = {
  companyPatch?: CompanyPatch;
  contactIds?: number[];
};


export async function updateCompanyWithContacts(
  ctx: CompanyAppContext,
  companyId: number,
  input: UpdateCompanyWithContactsInput
): Promise<Company> {
  const { companyPatch, contactIds } = input;

 
  let updatedCompany: Company | null = null;
  if (companyPatch && Object.keys(companyPatch).length > 0) {
    updatedCompany = await ctx.repos.company.update(companyId, companyPatch);
  }

 
  if (contactIds !== undefined) {
    await ctx.repos.company.assignContacts(companyId, contactIds);
  }

 
  if (!updatedCompany) {
    const company = await ctx.repos.company.getById(companyId);
    if (!company) {
      throw new Error(`Company with id ${companyId} not found`);
    }
    updatedCompany = company;
  }

  return updatedCompany;
}
