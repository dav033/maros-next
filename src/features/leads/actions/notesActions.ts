"use server";

import { serverApiClient } from "@/shared/infra/http";
import { LeadHttpRepository, makeLeadsAppContext, LeadNumberAvailabilityHttpService } from "@/leads";
import { ContactHttpRepository } from "@/contact";
import { ProjectTypeHttpRepository } from "@/projectType";
import { SystemClock } from "@/shared/domain";
import { patchLead } from "@/leads/application";
import type { Lead } from "@/leads/domain";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";

// Create server-side app context
function createServerLeadsAppContext() {
  return makeLeadsAppContext({
    clock: SystemClock,
    repos: {
      lead: new LeadHttpRepository(serverApiClient),
      contact: new ContactHttpRepository(serverApiClient),
      projectType: new ProjectTypeHttpRepository(),
    },
    services: {
      leadNumberAvailability: new LeadNumberAvailabilityHttpService(),
    },
  });
}

export async function updateLeadNotesAction(
  id: number,
  notes: string[]
): Promise<ActionResult<Lead>> {
  try {
    const ctx = createServerLeadsAppContext();
    const updated = await patchLead(ctx, id, { notes }, {});
    return success(updated);
  } catch (error) {
    return handleActionError(error);
  }
}

