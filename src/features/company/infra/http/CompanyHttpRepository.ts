import type { Company, CompanyDraft, CompanyPatch } from "../../domain/models";
import type { CompanyRepositoryPort } from "../../domain/ports";
import type { HttpClientLike } from "@/shared";
import { makeHttpResourceRepository, optimizedApiClient } from "@/shared";

import { companyEndpoints } from "./endpoints";
import {
  mapCompanyDraftToCreateDTO,
  mapCompanyFromApi,
  mapCompanyPatchToUpdateDTO,
  mapCompaniesFromApi,
  type ApiCompanyDTO,
} from "./mappers";

export class CompanyHttpRepository implements CompanyRepositoryPort {
  private readonly api: HttpClientLike;
  private readonly resource: ReturnType<
    typeof makeHttpResourceRepository<
      number,
      ApiCompanyDTO,
      Company,
      CompanyDraft,
      CompanyPatch
    >
  >;

  constructor(api: HttpClientLike = optimizedApiClient) {
    this.api = api;
    this.resource = makeHttpResourceRepository<
      number,
      ApiCompanyDTO,
      Company,
      CompanyDraft,
      CompanyPatch
    >({
      endpoints: companyEndpoints,
      mappers: {
        fromApi: mapCompanyFromApi,
        fromApiList: (dtos) => dtos.map(mapCompanyFromApi),
        toCreateDto: mapCompanyDraftToCreateDTO,
        toUpdateDto: mapCompanyPatchToUpdateDTO,
      },
      api: this.api,
    });
  }

  async getById(id: number): Promise<Company | null> {
    return this.resource.getById(id);
  }

  async list(): Promise<Company[]> {
    return this.resource.list();
  }

  async create(draft: CompanyDraft): Promise<Company> {
    return this.resource.create(draft);
  }

  async update(id: number, patch: CompanyPatch): Promise<Company> {
    console.log("[CompanyHttpRepository.update] Called with:", { id, patch });
    const result = await this.resource.update(id, patch);
    console.log("[CompanyHttpRepository.update] Result:", result);
    return result;
  }

  async delete(id: number): Promise<void> {
    return this.resource.delete(id);
  }

  async assignContacts(companyId: number, contactIds: number[]): Promise<void> {
    await this.api.post<void>(
      companyEndpoints.assignContacts(companyId),
      contactIds
    );
  }
}
