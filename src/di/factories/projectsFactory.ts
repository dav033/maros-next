import type { ProjectsAppContext } from "@/project";
import { makeProjectsAppContext } from "@/project";
import { ProjectHttpRepository } from "@/project/infra";
import { LeadHttpRepository } from "@/leads";

export function createProjectsAppContext(): ProjectsAppContext {
  return makeProjectsAppContext({
    repos: {
      project: new ProjectHttpRepository(),
      lead: new LeadHttpRepository(),
    },
  });
}



