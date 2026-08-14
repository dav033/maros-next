"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { CompanyHttpRepository, CompanyServiceHttpRepository, makeCompanyAppContext } from "@/company";
import { companyCrudUseCases, updateCompanyWithContacts } from "@/company/application";
import type { Company, CompanyDraft, CompanyPatch } from "@/company";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";

// Create server-side app context
async function createServerCompanyAppContext() {
  const apiClient = createServerApiClient(await headers());
  return makeCompanyAppContext({
    repos: {
      company: new CompanyHttpRepository(apiClient),
      companyService: new CompanyServiceHttpRepository(apiClient),
    },
  });
}

export async function createCompanyAction(
  draft: CompanyDraft,
  contactIds?: number[]
): Promise<ActionResult<Company>> {
  try {
    const ctx = await createServerCompanyAppContext();
    const created = await companyCrudUseCases.create(ctx)(draft);
    
    if (contactIds && contactIds.length > 0) {
      await ctx.repos.company.assignContacts(created.id, contactIds);
    }
    
    return success(created);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateCompanyAction(
  id: number,
  patch: CompanyPatch,
  contactIds?: number[]
): Promise<ActionResult<Company>> {
  try {
    const ctx = await createServerCompanyAppContext();
    const updated = await updateCompanyWithContacts(ctx, id, {
      companyPatch: Object.keys(patch).length > 0 ? patch : undefined,
      contactIds,
    });
    
    return success(updated);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteCompanyAction(id: number): Promise<ActionResult<void>> {
  try {
    const ctx = await createServerCompanyAppContext();
    await companyCrudUseCases.delete(ctx)(id);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}

