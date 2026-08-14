"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { CompanyHttpRepository, CompanyServiceHttpRepository, makeCompanyAppContext } from "@/company";
import { companyCrudUseCases } from "@/company/application";
import type { Company } from "@/company";
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

export async function updateCompanyNotesAction(
  id: number,
  notes: string[]
): Promise<ActionResult<Company>> {
  try {
    const ctx = await createServerCompanyAppContext();
    const updated = await companyCrudUseCases.update(ctx)(id, { notes });
    return success(updated);
  } catch (error) {
    return handleActionError(error);
  }
}



