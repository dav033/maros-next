import { serverApiClient } from "@/shared/infra";
import { AppError } from "@/shared/errors";
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
  } catch (error) {
    const appError = AppError.from(error);
    const errorMessage =
      appError.kind === "not_found"
        ? `No encontramos el lead solicitado.`
        : appError.userMessage;

    return {
      leadDetails: null,
      error: errorMessage,
    };
  }
}
