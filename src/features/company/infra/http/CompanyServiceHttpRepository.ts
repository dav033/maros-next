import type {
  CompanyService,
  CompanyServiceDraft,
  CompanyServicePatch,
} from "@/features/company/domain";
import type { CompanyServiceRepositoryPort } from "@/features/company/domain";
import type { HttpClientLike } from "@/shared/infra";
import {
  makeHttpResourceRepository,
  optimizedApiClient,
} from "@/shared/infra";

import { companyServiceEndpoints } from "./endpoints";
import {
  mapCompanyServiceDraftToCreateDTO,
  mapCompanyServiceFromApi,
  mapCompanyServicePatchToUpdateDTO,
  mapCompanyServicesFromApi,
  type ApiCompanyServiceDTO,
} from "./mappers";

export class CompanyServiceHttpRepository
  implements CompanyServiceRepositoryPort
{
  private readonly api: HttpClientLike;
  private readonly resource: ReturnType<
    typeof makeHttpResourceRepository<
      number,
      ApiCompanyServiceDTO,
      CompanyService,
      CompanyServiceDraft,
      CompanyServicePatch
    >
  >;

  constructor(api: HttpClientLike = optimizedApiClient) {
    this.api = api;
    this.resource =
      makeHttpResourceRepository<
        number,
        ApiCompanyServiceDTO,
        CompanyService,
        CompanyServiceDraft,
        CompanyServicePatch
      >({
        endpoints: companyServiceEndpoints,
        mappers: {
          fromApi: mapCompanyServiceFromApi,
          fromApiList: mapCompanyServicesFromApi,
          toCreateDto: mapCompanyServiceDraftToCreateDTO,
          toUpdateDto: mapCompanyServicePatchToUpdateDTO,
        },
        api: this.api,
      });
  }

  async getById(id: number): Promise<CompanyService | null> {
    return this.resource.getById(id);
  }

  async list(): Promise<CompanyService[]> {
    return this.resource.list();
  }

  async create(draft: CompanyServiceDraft): Promise<CompanyService> {
    return this.resource.create(draft);
  }

  async update(
    id: number,
    patch: CompanyServicePatch
  ): Promise<CompanyService> {
    return this.resource.update(id, patch);
  }

  async delete(id: number): Promise<void> {
    return this.resource.delete(id);
  }
}
