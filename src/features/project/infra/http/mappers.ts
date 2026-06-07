import type { Project, ProjectDraft, ProjectPatch } from "@/project/domain";
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
