import type { Contact } from "@/contact/domain";
import type { Company } from "@/company/domain";
import type { HttpClientLike } from "@/shared/infra";
import { optimizedApiClient } from "@/shared/infra";
import { mapContactFromApi, type ApiContactDTO } from "@/features/contact/infra/http/mappers";
import { mapCompanyFromApi, type ApiCompanyDTO } from "@/features/company/infra/http/mappers";

import { customersEndpoints } from "./endpoints";
import type { CustomersData } from "../../domain/Customer";

interface ApiCustomersResponse {
  contacts: ApiContactDTO[];
  companies: ApiCompanyDTO[];
}


export class CustomersHttpRepository {
  private readonly api: HttpClientLike;

  constructor(api: HttpClientLike = optimizedApiClient) {
    this.api = api;
  }

  
  async getCustomers(): Promise<CustomersData> {
    const { data } = await this.api.get<ApiCustomersResponse>(
      customersEndpoints.getCustomers()
    );

    if (!data) {
      return { contacts: [], companies: [] };
    }

    return {
      contacts: (data.contacts ?? []).map(mapContactFromApi),
      companies: (data.companies ?? []).map(mapCompanyFromApi),
    };
  }

  
  async findAll(): Promise<CustomersData> {
    return this.getCustomers();
  }
}
