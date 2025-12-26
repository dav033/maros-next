"use server";

import { serverApiClient } from "@/shared/infra/http";
import { CompanyHttpRepository, CompanyServiceHttpRepository, makeCompanyAppContext } from "@/company";
import { companyCrudUseCases } from "@/company/application";
import type { Company } from "@/company";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";

// Create server-side app context
function createServerCompanyAppContext() {
  return makeCompanyAppContext({
    repos: {
      company: new CompanyHttpRepository(serverApiClient),
      companyService: new CompanyServiceHttpRepository(serverApiClient),
    },
  });
}

export async function updateCompanyNotesAction(
  id: number,
  notes: string[]
): Promise<ActionResult<Company>> {
  try {
    const ctx = createServerCompanyAppContext();
    const updated = await companyCrudUseCases.update(ctx)(id, { notes });
    return success(updated);
  } catch (error) {
    return handleActionError(error);
  }
}



