import type { Contact } from "@/contact/domain";
import type { Company } from "@/company/domain";

/**
 * Domain model representing customer data
 * A customer can be either a Contact or a Company (or both)
 * This is an aggregate of both entities marked as customers
 */
export interface CustomersData {
  contacts: Contact[];
  companies: Company[];
}

/**
 * Type alias for backward compatibility
 */
export type CustomersResponse = CustomersData;
