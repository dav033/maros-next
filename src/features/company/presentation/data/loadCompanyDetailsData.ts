import { serverApiClient } from "@/shared/infra";
import { AppError } from "@/shared/errors";
import { CompanyHttpRepository } from "@/features/company/infra/http/CompanyHttpRepository";

interface CompanyDetails {
  id: number;
  name: string;
  address?: string;
  addressLink?: string;
  type: any;
  serviceId?: number | null;
  isCustomer: boolean;
  isClient: boolean;
  notes: string[];
  phone?: string;
  email?: string;
  submiz?: string;
  contacts?: Array<{
    id: number;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    addressLink?: string;
    isCustomer: boolean;
    isClient: boolean;
    notes: string[];
  }>;
}

export async function loadCompanyDetailsData(companyId: number) {
  const companyRepository = new CompanyHttpRepository(serverApiClient);
  
  try {
    const companyDetails = await companyRepository.getById(companyId);
    
    if (!companyDetails || !companyDetails.id) {
      return { 
        companyDetails: null, 
        error: `Company with ID ${companyId} not found` 
      };
    }
    
    // Fetch contacts for this company
    let contacts: any[] = [];
    try {
      const contactsResponse = await serverApiClient.get<any[]>(
        `/contacts/company/${companyId}`
      );
      contacts = contactsResponse.data || [];
    } catch {
      // Continue without contacts
    }
    
    const companyDetailsWithContacts: CompanyDetails = {
      ...companyDetails,
      contacts,
    };
    
    return { companyDetails: companyDetailsWithContacts };
  } catch (error) {
    const appError = AppError.from(error);
    const errorMessage =
      appError.kind === "not_found"
        ? `No encontramos la compañía solicitada.`
        : appError.userMessage;

    return {
      companyDetails: null,
      error: errorMessage,
    };
  }
}
