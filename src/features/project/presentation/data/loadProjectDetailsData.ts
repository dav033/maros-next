import { serverApiClient } from "@/shared/infra";
import { AppError } from "@/shared/errors";
import { ProjectHttpRepository } from "@/project/infra/http/ProjectHttpRepository";

export async function loadProjectDetailsData(projectId: number) {
  const projectRepository = new ProjectHttpRepository(serverApiClient);
  
  try {
    const projectDetails = await projectRepository.getDetails(projectId);
    
    if (!projectDetails || !projectDetails.id) {
      return { 
        projectDetails: null, 
        error: `Project with ID ${projectId} not found` 
      };
    }
    
    return { projectDetails };
  } catch (error) {
    const appError = AppError.from(error);
    const errorMessage =
      appError.kind === "not_found"
        ? `No encontramos el proyecto solicitado.`
        : appError.userMessage;

    return {
      projectDetails: null,
      error: errorMessage,
    };
  }
}
