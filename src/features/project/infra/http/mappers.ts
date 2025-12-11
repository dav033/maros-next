import type { Project, ProjectDraft, ProjectPatch } from "@/project/domain";
import type { ApiProjectDTO } from "@/project/domain/services/projectReadMapper";
import { mapProjectFromDTO, mapProjectsFromDTO } from "@/project/domain";
import { mapLeadFromDTO } from "@/leads/domain/services/leadReadMapper";

export type CreateProjectPayload = {
  invoiceAmount?: number;
  payments?: number[];
  projectProgressStatus?: string;
  invoiceStatus?: string;
  quickbooks?: boolean;
  overview?: string;
  leadId: number;
};

export type UpdateProjectPayload = {
  invoiceAmount?: number;
  payments?: number[];
  projectProgressStatus?: string;
  invoiceStatus?: string;
  quickbooks?: boolean;
  overview?: string;
  leadId?: number;
};

export function mapProjectFromApi(dto: ApiProjectDTO): Project {
  return mapProjectFromDTO(dto, mapLeadFromDTO);
}

export function mapProjectsFromApi(dtos: ApiProjectDTO[]): Project[] {
  return mapProjectsFromDTO(dtos, mapLeadFromDTO);
}

export function mapProjectDraftToCreatePayload(
  draft: ProjectDraft
): CreateProjectPayload {
  return {
    invoiceAmount: draft.invoiceAmount,
    payments: draft.payments,
    projectProgressStatus: draft.projectProgressStatus,
    invoiceStatus: draft.invoiceStatus,
    quickbooks: draft.quickbooks,
    overview: draft.overview,
    leadId: draft.leadId,
  };
}

export function mapProjectPatchToUpdatePayload(
  patch: ProjectPatch
): UpdateProjectPayload {
  return {
    invoiceAmount: patch.invoiceAmount,
    payments: patch.payments,
    projectProgressStatus: patch.projectProgressStatus,
    invoiceStatus: patch.invoiceStatus,
    quickbooks: patch.quickbooks,
    overview: patch.overview,
    leadId: patch.leadId,
  };
}

