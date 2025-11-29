import type { Contact } from "@/contact";
import type { Company } from "@/company";

export interface CustomersResponse {
  contacts: Contact[];
  companies: Company[];
}

