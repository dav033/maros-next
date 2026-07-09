"use server";

import { serverApiClient } from "@/shared/infra/http";
import { LeadHttpRepository, makeLeadsAppContext, LeadNumberAvailabilityHttpService } from "@/leads";
import { ContactHttpRepository } from "@/contact";
import { ProjectTypeHttpRepository } from "@/projectType";
import { SystemClock } from "@/shared/domain";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";
import { endpoints } from "@/leads/infra/http/endpoints";
import { LeadStatus, canTransition } from "@/leads/domain";

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

export async function updateLeadNameAction(id: number, name: string): Promise<ActionResult<void>> {
  try {
    const ctx = createServerLeadsAppContext();
    await ctx.repos.lead.update(id, { name: name.trim() });
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

/**
 * Actualiza el estado (status) de un lead.
 * Valida que el ID sea un entero positivo, que el status exista en el enum,
 * que el lead exista y que la transición de estado sea válida.
 *
 * @param id - ID numérico del lead.
 * @param status - Nuevo estado (LeadStatus).
 * @returns ActionResult vacío si la operación fue exitosa, o un error en caso contrario.
 */
export async function updateLeadStatusAction(
  id: number,
  status: LeadStatus
): Promise<ActionResult<void>> {
  try {
    if (!Number.isFinite(id) || id <= 0 || !Number.isInteger(id)) {
      return { success: false, error: "Invalid lead ID" };
    }
    if (!Object.values(LeadStatus).includes(status)) {
      return { success: false, error: "Invalid lead status" };
    }
    const ctx = createServerLeadsAppContext();
    const lead = await ctx.repos.lead.getById(id);
    if (!lead) {
      return { success: false, error: "Lead not found" };
    }
    if (!canTransition(lead.status, status)) {
      return { success: false, error: "Invalid status transition" };
    }
    await ctx.repos.lead.update(id, { status });
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Actualiza el tipo de proyecto (project type) de un lead.
 * Valida que el ID del lead y del project type sean enteros positivos.
 *
 * @param id - ID numérico del lead.
 * @param projectTypeId - ID del nuevo tipo de proyecto.
 * @returns ActionResult vacío si la operación fue exitosa, o un error en caso contrario.
 */
export async function updateLeadProjectTypeAction(
  id: number,
  projectTypeId: number
): Promise<ActionResult<void>> {
  try {
    if (!Number.isFinite(id) || id <= 0 || !Number.isInteger(id)) {
      return { success: false, error: "Invalid lead ID" };
    }
    if (!Number.isFinite(projectTypeId) || projectTypeId <= 0 || !Number.isInteger(projectTypeId)) {
      return { success: false, error: "Invalid project type" };
    }
    const ctx = createServerLeadsAppContext();
    await ctx.repos.lead.update(id, { projectTypeId });
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}