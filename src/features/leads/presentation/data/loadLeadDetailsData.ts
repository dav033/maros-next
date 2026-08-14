import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra";
import { AppError } from "@/shared/errors";
import { LeadHttpRepository } from "@/leads/infra/http/LeadHttpRepository";

export async function loadLeadDetailsData(leadId: number) {
  // The cookieless `serverApiClient` singleton used to be wired in here, so every
  // one of these server-side reads came back 401 regardless of the real session.
  const apiClient = createServerApiClient(await headers());
  const leadRepository = new LeadHttpRepository(apiClient);
  
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
