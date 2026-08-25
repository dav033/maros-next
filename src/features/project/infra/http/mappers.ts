import type { Project, ProjectDraft, ProjectPatch, ProjectClientSummary, ProjectPaymentSummary } from "@/project/domain";
import type { ApiProjectDTO } from "@/project/domain/services/projectReadMapper";
import { mapProjectFromDTO, mapProjectsFromDTO } from "@/project/domain";
import { mapLeadFromDTO } from "@/leads/domain/services/leadReadMapper";

export type CreateProjectPayload = {
  projectProgressStatus?: string;
  overview?: string;
  leadId: number;
  attachments?: string[];
};

export type UpdateProjectPayload = {
  projectProgressStatus?: string;
  overview?: string;
  leadId?: number;
  leadName?: string;
  leadNumber?: string;
  notes?: string[];
  attachments?: string[];
};

function mapClient(input: unknown): ProjectClientSummary {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  if (typeof value.id !== "number" || (value.type !== "contact" && value.type !== "company") || typeof value.name !== "string") return null;
  return {
    id: value.id,
    type: value.type,
    name: value.name,
    isClient: value.isClient === true,
    isCustomer: value.isCustomer === true,
  };
}

function mapPaymentSummary(input: unknown): ProjectPaymentSummary | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  return {
    count: typeof value.count === "number" ? value.count : 0,
    totalAmount: typeof value.totalAmount === "number" ? value.totalAmount : 0,
    lastPaymentDate: typeof value.lastPaymentDate === "string" ? value.lastPaymentDate : null,
    hasDetails: value.hasDetails !== false,
  };
}

export function mapProjectFromApi(dto: ApiProjectDTO): Project {
  const project = mapProjectFromDTO(dto, mapLeadFromDTO);
  return {
    ...project,
    client: mapClient(dto?.client),
    paymentSummary: mapPaymentSummary(dto?.paymentSummary),
  };
}

export function mapProjectsFromApi(dtos: ApiProjectDTO[]): Project[] {
  return mapProjectsFromDTO(dtos, mapLeadFromDTO).map((project, index) => ({
    ...project,
    client: mapClient(dtos[index]?.client),
    paymentSummary: mapPaymentSummary(dtos[index]?.paymentSummary),
  }));
}

export function mapProjectDraftToCreatePayload(
  draft: ProjectDraft
): CreateProjectPayload {
  return {
    projectProgressStatus: draft.projectProgressStatus,
    overview: draft.overview,
    leadId: draft.leadId,
    attachments: draft.attachments,
  };
}

export function mapProjectPatchToUpdatePayload(
  patch: ProjectPatch
): UpdateProjectPayload {
  return {
    projectProgressStatus: patch.projectProgressStatus,
    overview: patch.overview,
    leadId: patch.leadId,
    leadName: patch.leadName,
    leadNumber: patch.leadNumber,
    notes: patch.notes,
    attachments: patch.attachments,
  };
}
