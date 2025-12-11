import type { Contact } from "@/contact/domain";
import type { Company } from "@/company/domain";


export interface CustomersData {
  contacts: Contact[];
  companies: Company[];
}


export type CustomersResponse = CustomersData;
