"use server";

import { serverApiClient } from "@/shared/infra/http";
import { LeadHttpRepository, makeLeadsAppContext, LeadNumberAvailabilityHttpService } from "@/leads";
import { ContactHttpRepository } from "@/contact";
import { ProjectTypeHttpRepository } from "@/projectType";
import { SystemClock } from "@/shared/domain";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";
import { endpoints } from "@/leads/infra/http/endpoints";

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

export interface LeadRejectionInfo {
  lead: { id: number; name: string };
  contact: { id: number; name: string; canDelete: boolean; otherLeadsCount: number } | null;
  company: { id: number; name: string; canDelete: boolean; otherLeadsCount: number } | null;
}

export async function getLeadRejectionInfoAction(id: number): Promise<ActionResult<LeadRejectionInfo>> {
  try {
    const { data } = await serverApiClient.get<LeadRejectionInfo>(endpoints.getRejectionInfo(id));
    return success(data);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteLeadAction(
  id: number,
  options?: { deleteContact?: boolean; deleteCompany?: boolean }
): Promise<ActionResult<void>> {
  try {
    const params = new URLSearchParams();
    if (options?.deleteContact) params.append('deleteContact', 'true');
    if (options?.deleteCompany) params.append('deleteCompany', 'true');
    
    const url = `${endpoints.remove(id)}${params.toString() ? `?${params.toString()}` : ''}`;
    await serverApiClient.delete(url);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function acceptLeadAction(id: number): Promise<ActionResult<void>> {
  try {
    const ctx = createServerLeadsAppContext();
    await ctx.repos.lead.update(id, { inReview: false });
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}