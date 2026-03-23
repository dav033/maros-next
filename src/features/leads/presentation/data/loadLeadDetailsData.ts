import { serverApiClient } from "@/shared/infra";
import { LeadHttpRepository } from "@/leads/infra/http/LeadHttpRepository";

export async function loadLeadDetailsData(leadId: number) {
  const leadRepository = new LeadHttpRepository(serverApiClient);
  
  try {
    const leadDetails = await leadRepository.getDetails(leadId);
    
    if (!leadDetails || !leadDetails.id) {
      return { 
        leadDetails: null, 
        error: `Lead with ID ${leadId} not found` 
      };
    }
    
    return { leadDetails };
  } catch (error: any) {
    console.error("Error loading lead details:", error);
    
    let errorMessage = "Unknown error";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    
    if (error?.response?.status === 404) {
      errorMessage = `Lead with ID ${leadId} not found`;
    }
    
    return { 
      leadDetails: null, 
      error: errorMessage 
    };
  }
}
