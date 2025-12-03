import type { Company, CompanyPatch } from "@/company";
import type { CompanyAppContext } from "../../context";

export type UpdateCompanyWithContactsInput = {
  companyPatch?: CompanyPatch;
  contactIds?: number[];
};

/**
 * Updates a company and optionally assigns contacts to it.
 * This use case consolidates both operations into a single transaction-like flow.
 * 
 * @param ctx - The company application context
 * @param companyId - The ID of the company to update
 * @param input - An object containing the company patch and/or contact IDs
 * @returns The updated company
 */
export async function updateCompanyWithContacts(
  ctx: CompanyAppContext,
  companyId: number,
  input: UpdateCompanyWithContactsInput
): Promise<Company> {
  const { companyPatch, contactIds } = input;

  // Step 1: Update company data if there are changes
  let updatedCompany: Company | null = null;
  if (companyPatch && Object.keys(companyPatch).length > 0) {
    updatedCompany = await ctx.repos.company.update(companyId, companyPatch);
  }

  // Step 2: Assign contacts if provided
  if (contactIds !== undefined) {
    await ctx.repos.company.assignContacts(companyId, contactIds);
  }

  // Step 3: Fetch the latest company state if we only assigned contacts
  if (!updatedCompany) {
    const company = await ctx.repos.company.getById(companyId);
    if (!company) {
      throw new Error(`Company with id ${companyId} not found`);
    }
    updatedCompany = company;
  }

  return updatedCompany;
}
