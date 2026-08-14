"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { LeadHttpRepository, makeLeadsAppContext, LeadNumberAvailabilityHttpService } from "@/leads";
import { ContactHttpRepository } from "@/contact";
import { ProjectTypeHttpRepository } from "@/projectType";
import { SystemClock } from "@/shared/domain";
import { patchLead } from "@/leads/application";
import type { Lead } from "@/leads/domain";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";

// The plain `serverApiClient` singleton carries no request context and forwards no
// cookie — every call through it comes back 401 ("Tu sesión expiró") no matter what
// the browser's session is. createServerApiClient forwards this request's Cookie
// header instead.
async function createServerLeadsAppContext() {
  const apiClient = createServerApiClient(await headers());
  return makeLeadsAppContext({
    clock: SystemClock,
    repos: {
      lead: new LeadHttpRepository(apiClient),
      contact: new ContactHttpRepository(apiClient),
      projectType: new ProjectTypeHttpRepository(apiClient),
    },
    services: {
      leadNumberAvailability: new LeadNumberAvailabilityHttpService(apiClient),
    },
  });
}

export async function updateLeadNotesAction(
  id: number,
  notes: string[]
): Promise<ActionResult<Lead>> {
  try {
    const ctx = await createServerLeadsAppContext();
    const updated = await patchLead(ctx, id, { notes }, {});
    return success(updated);
  } catch (error) {
    return handleActionError(error);
  }
}

