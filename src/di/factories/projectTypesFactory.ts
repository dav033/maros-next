import type { ProjectTypesAppContext } from "@/projectType";
import { ProjectTypeHttpRepository } from "@/projectType";


export function createProjectTypesAppContext(): ProjectTypesAppContext {
  return {
    repos: {
      projectType: new ProjectTypeHttpRepository(),
    },
  };
}
