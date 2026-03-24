import { serverApiClient } from "@/shared/infra";
import { ContactHttpRepository } from "@/contact";

export async function loadContactDetailsData(contactId: number) {
  const contactRepository = new ContactHttpRepository(serverApiClient);
  
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
  } catch (error: any) {
    
    // Extraer mensaje de error más específico
    let errorMessage = "Unknown error";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    
    // Si es un 404, mensaje más específico
    if (error?.response?.status === 404) {
      errorMessage = `Contact with ID ${contactId} not found`;
    }
    
    return { 
      contactDetails: null, 
      error: errorMessage 
    };
  }
}
