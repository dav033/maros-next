import type { LeadType } from "@/features/leads/domain/models";
import type { ApiLeadDTO } from "@/features/leads/infra/http/mappers";
import type { HttpClientLike } from "@/shared";
import type { Lead, LeadDraft, LeadPatch } from "@/features/leads/domain/models";
import type { LeadRepositoryPort } from "@/features/leads/domain/ports";
import { optimizedApiClient } from "@/shared";
import type { RestRepository } from "@/shared/infra/rest/makeResource";
import { makeResource } from "@/shared/infra/rest/makeResource";

import { endpoints as leadEndpoints } from "./endpoints";
import {
  type CreateLeadPayload,
  type CreateLeadWithExistingContactPayload,
  type CreateLeadWithNewContactPayload,
  mapLeadDraftToCreatePayload,
  mapLeadFromApi,
  mapLeadPatchToUpdatePayload,
  mapLeadsFromApi,
} from "./mappers";

export class LeadHttpRepository implements LeadRepositoryPort {
  private readonly resource: RestRepository<number, Lead, LeadDraft, LeadPatch>;

  constructor(private readonly api: HttpClientLike = optimizedApiClient) {
    this.resource = makeResource<ApiLeadDTO, Lead, LeadDraft, LeadPatch, number>(
      leadEndpoints,
      { fromApi: mapLeadFromApi, fromApiList: mapLeadsFromApi },
    );
  }

  getById = (id: number) => this.resource.findById(id);
  findById = (id: number) => this.getById(id);
  list = () => this.resource.findAll();
  delete = (id: number) => this.resource.delete(id);

  async findByType(type: LeadType): Promise<Lead[]> {
    const { data } = await this.api.get<ApiLeadDTO[]>(
      leadEndpoints.listByType(String(type))
    );
    return mapLeadsFromApi(Array.isArray(data) ? data : []);
  }

  create = async (draft: LeadDraft): Promise<Lead> => {
    const payload: CreateLeadPayload = mapLeadDraftToCreatePayload(draft);
    // Convert notes array to JSON string if present
    if ((draft as any).notes) {
      (payload as any).notesJson = JSON.stringify((draft as any).notes);
    }
    if ("contact" in (payload as Record<string, unknown>)) {
      const { contact, projectTypeId, ...leadData } =
        payload as CreateLeadWithNewContactPayload;
      const { data } = await this.api.post<ApiLeadDTO>(
        leadEndpoints.createWithNewContact(),
        {
          lead: { ...leadData, projectType: { id: projectTypeId } },
          contact,
        }
      );
      if (!data) throw new Error("Empty response creating Lead with new contact");
      return mapLeadFromApi(data);
    }
    const { contactId, projectTypeId, ...leadData } =
      payload as CreateLeadWithExistingContactPayload;
    const { data } = await this.api.post<ApiLeadDTO>(
      leadEndpoints.createWithExistingContact(),
      {
        lead: { ...leadData, projectType: { id: projectTypeId } },
        contactId,
      }
    );
    if (!data) throw new Error("Empty response creating Lead with existing contact");
    return mapLeadFromApi(data);
  };

  saveNew = async (draft: LeadDraft): Promise<Lead> => {
    return this.create(draft);
  };

  update = async (id: number, patch: LeadPatch): Promise<Lead> => {
    const payload = mapLeadPatchToUpdatePayload(patch);
    const { projectTypeId, contactId, ...rest } = payload;
    const leadData: Record<string, unknown> = { ...rest };

    if (projectTypeId !== undefined) {
      leadData.projectType = { id: projectTypeId };
    }
    if (contactId !== undefined) {
      leadData.contact = { id: contactId };
    }

    const url = leadEndpoints.update(id);
    const body = { lead: leadData };
    console.log('[FRONT] LeadHttpRepository.update - URL:', url);
    console.log('[FRONT] LeadHttpRepository.update - Body:', body);
    const { data } = await this.api.put<ApiLeadDTO>(url, body);
    console.log('[FRONT] LeadHttpRepository.update - Response:', data);
    if (!data) throw new Error("Empty response updating Lead");
    return mapLeadFromApi(data);
  };
}
