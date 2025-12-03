import type { Contact } from "@/contact";
import type { Company } from "@/company";
import type { CustomersData } from "../../domain/Customer";

/**
 * API DTO representing the customers response from the backend
 */
export interface ApiCustomersResponseDTO {
  contacts: Contact[];
  companies: any[]; // ApiCompanyDTO from company feature
}

/**
 * Maps API response to domain model
 */
export function mapCustomersFromApi(dto: ApiCustomersResponseDTO): CustomersData {
  // The mapping will be done by the repository using feature-specific mappers
  return {
    contacts: dto.contacts || [],
    companies: dto.companies || [],
  };
}
