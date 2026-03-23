import { serverApiClient } from "@/shared/infra";
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
  } catch (error: any) {
    console.error("Error loading project details:", error);
    
    let errorMessage = "Unknown error";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    
    if (error?.response?.status === 404) {
      errorMessage = `Project with ID ${projectId} not found`;
    }
    
    return { 
      projectDetails: null, 
      error: errorMessage 
    };
  }
}
