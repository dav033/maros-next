import { serverApiClient } from "@/shared/infra";
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
    } catch (error) {
      console.warn("Could not load contacts for company:", error);
      // Continue without contacts
    }
    
    const companyDetailsWithContacts: CompanyDetails = {
      ...companyDetails,
      contacts,
    };
    
    return { companyDetails: companyDetailsWithContacts };
  } catch (error: any) {
    console.error("Error loading company details:", error);
    
    let errorMessage = "Unknown error";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    
    if (error?.response?.status === 404) {
      errorMessage = `Company with ID ${companyId} not found`;
    }
    
    return { 
      companyDetails: null, 
      error: errorMessage 
    };
  }
}
