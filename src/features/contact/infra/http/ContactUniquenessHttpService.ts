import type { Contact } from "@/contact";
import type {
  ApiContactDTO,
  ContactUniquenessCheck,
  ContactUniquenessPort,
} from "@/contact";
import { findDuplicate, mapContactsFromDTO, toUniquenessCandidate } from "@/contact";
import type { HttpClientLike } from "@/shared";
import { optimizedApiClient } from "@/shared";

import { contactEndpoints as endpoints } from "./endpoints";

export class ContactUniquenessHttpService implements ContactUniquenessPort {
  private readonly api: HttpClientLike;

  constructor(api: HttpClientLike = optimizedApiClient) {
    this.api = api;
  }

  async isDuplicate(
    candidate: ContactUniquenessCheck
  ): Promise<{ duplicate: boolean; conflictId?: number }> {
    const { data } = await this.api.get<{
      duplicate: boolean;
      conflictId?: number;
    }>(endpoints.uniquenessCheck(), {
      params: {
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
      },
    });
    return data ?? { duplicate: false };
  }

  async findDuplicates(candidate: ContactUniquenessCheck): Promise<Contact[]> {
    const listUrl = endpoints.list?.() ?? endpoints.base;
    const { data } = await this.api.get<ApiContactDTO[]>(listUrl);
    const all = mapContactsFromDTO(data ?? []);
    const candidateContact = toUniquenessCandidate(candidate);
    const results: Contact[] = [];
    for (const contact of all) {
      const duplicate = findDuplicate([contact], candidateContact);
      if (duplicate) {
        results.push(duplicate);
      }
    }
    return results;
  }
}
