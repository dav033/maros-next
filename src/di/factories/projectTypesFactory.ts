import type { ProjectTypesAppContext } from "@/projectType";
import { ProjectTypeHttpRepository } from "@/projectType";

/**
 * Factory for creating the ProjectTypes application context.
 * Encapsulates all project type related dependencies.
 */
export function createProjectTypesAppContext(): ProjectTypesAppContext {
  return {
    repos: {
      projectType: new ProjectTypeHttpRepository(),
    },
  };
}
