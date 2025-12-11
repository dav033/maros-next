import type { Contact } from "@/contact/domain";
import type { Company } from "@/company/domain";
import type { CustomersData } from "../../domain/Customer";


export interface ApiCustomersResponseDTO {
  contacts: Contact[];
  companies: any[];
}


export function mapCustomersFromApi(dto: ApiCustomersResponseDTO): CustomersData {
 
  return {
    contacts: dto.contacts || [],
    companies: dto.companies || [],
  };
}
