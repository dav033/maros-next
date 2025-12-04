import type { Contact, ContactDraft, ContactPatch } from "@/features/contact/domain";
import type { ContactRepositoryPort } from "@/features/contact/domain";
import type { HttpClientLike } from "@/shared/infra";
import { makeHttpResourceRepository, optimizedApiClient } from "@/shared/infra";

import { contactEndpoints } from "./endpoints";
import {
  mapContactDraftToCreateDTO,
  mapContactFromApi,
  mapContactPatchToUpdateDTO,
  mapContactsFromApi,
} from "./mappers";

export class ContactHttpRepository implements ContactRepositoryPort {
  private readonly api: HttpClientLike;
  private readonly resource: ReturnType<
    typeof makeHttpResourceRepository<number, Contact, Contact, ContactDraft, ContactPatch>
  >;

  constructor(api: HttpClientLike = optimizedApiClient) {
    this.api = api;
    this.resource = makeHttpResourceRepository<number, Contact, Contact, ContactDraft, ContactPatch>(
      {
        endpoints: contactEndpoints,
        mappers: {
          fromApi: mapContactFromApi,
          fromApiList: (dtos) => dtos.map(mapContactFromApi),
          toCreateDto: mapContactDraftToCreateDTO,
          toUpdateDto: mapContactPatchToUpdateDTO,
        },
        api: this.api,
      }
    );
  }

  async create(draft: ContactDraft): Promise<Contact> {
    return this.resource.create(draft);
  }

  async update(id: number, patch: ContactPatch): Promise<Contact> {
    return this.resource.update(id, patch);
  }

  async delete(id: number): Promise<void> {
    return this.resource.delete(id);
  }

  async getById(id: number): Promise<Contact | null> {
    return this.resource.getById(id);
  }

  async list(): Promise<Contact[]> {
    return this.resource.list();
  }

  async findById(id: number): Promise<Contact | null> {
    return this.getById(id);
  }

  async findAll(): Promise<Contact[]> {
    return this.list();
  }

  async search(query: string): Promise<Contact[]> {
    const { data } = await this.api.get<Contact[]>(
      contactEndpoints.search(query)
    );
    return Array.isArray(data) ? data : [];
  }
}
