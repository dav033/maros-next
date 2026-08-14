import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra";
import { AppError } from "@/shared/errors";
import { ContactHttpRepository } from "@/contact";

export async function loadContactDetailsData(contactId: number) {
  // The cookieless `serverApiClient` singleton used to be wired in here, so every
  // one of these server-side reads came back 401 regardless of the real session.
  const apiClient = createServerApiClient(await headers());
  const contactRepository = new ContactHttpRepository(apiClient);
  
  try {
    const contactDetails = await contactRepository.getDetails(contactId);
    
    // Verificar si el contacto existe
    if (!contactDetails || !contactDetails.id) {
      return { 
        contactDetails: null, 
        error: `Contact with ID ${contactId} not found` 
      };
    }
    
    return { contactDetails };
  } catch (error) {
    const appError = AppError.from(error);
    const errorMessage =
      appError.kind === "not_found"
        ? `No encontramos el contacto solicitado.`
        : appError.userMessage;

    return {
      contactDetails: null,
      error: errorMessage,
    };
  }
}
