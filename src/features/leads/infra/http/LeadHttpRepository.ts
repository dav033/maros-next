import type { LeadType } from "@/features/leads/domain/models";
import type { ApiLeadDTO } from "@/features/leads/infra/http/mappers";
import type { HttpClientLike, ResourceRepository } from "@/shared/infra";
import type { Lead, LeadDraft, LeadPatch } from "@/features/leads/domain/models";
import type { LeadRepositoryPort } from "@/features/leads/domain/ports";
import { optimizedApiClient } from "@/shared/infra";
import { makeHttpResourceRepository } from "@/shared/infra";

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
  private readonly resource: ResourceRepository<number, Lead, LeadDraft, LeadPatch>;

  constructor(private readonly api: HttpClientLike = optimizedApiClient) {
    this.resource = makeHttpResourceRepository<number, ApiLeadDTO, Lead, LeadDraft, LeadPatch>({
      endpoints: leadEndpoints,
      mappers: { fromApi: mapLeadFromApi, fromApiList: mapLeadsFromApi },
      api: this.api,
    });
  }

  getById = (id: number) => this.resource.getById(id);
  findById = (id: number) => this.getById(id);
  list = () => this.resource.list();
  delete = (id: number) => this.resource.delete(id);

  async findByType(type: LeadType): Promise<Lead[]> {
    const { data } = await this.api.get<ApiLeadDTO[]>(
      leadEndpoints.listByType(String(type))
    );
    return mapLeadsFromApi(Array.isArray(data) ? data : []);
  }

  create = async (draft: LeadDraft): Promise<Lead> => {
    const payload: CreateLeadPayload = mapLeadDraftToCreatePayload(draft);
    
    if ("contact" in (payload as Record<string, unknown>)) {
      const { contact, projectTypeId, leadNumber, name, ...leadData } =
        payload as CreateLeadWithNewContactPayload;
      
      const leadPayload: Record<string, unknown> = { ...leadData, projectTypeId };
      if (name && name.trim() !== '') {
        leadPayload.name = name;
      }
      
      const { data } = await this.api.post<ApiLeadDTO>(
        leadEndpoints.createWithNewContact(),
        {
          lead: leadPayload,
          contact,
        }
      );
      if (!data) throw new Error("Empty response creating Lead with new contact");
      return mapLeadFromApi(data);
    }
    const { contactId, projectTypeId, leadNumber, name, ...leadData } =
      payload as CreateLeadWithExistingContactPayload;
    
    const leadPayload: Record<string, unknown> = { ...leadData, projectTypeId };
    if (name && name.trim() !== '') {
      leadPayload.name = name;
    }
    
    const { data } = await this.api.post<ApiLeadDTO>(
      leadEndpoints.createWithExistingContact(),
      {
        lead: leadPayload,
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
    const { data } = await this.api.put<ApiLeadDTO>(url, body);
    if (!data) throw new Error("Empty response updating Lead");
    return mapLeadFromApi(data);
  };
}
