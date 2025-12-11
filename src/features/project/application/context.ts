import type { ProjectRepositoryPort } from "@/features/project/domain";
import type { LeadRepositoryPort } from "@/features/leads/domain";

export type ProjectsAppContext = Readonly<{
  repos: {
    project: ProjectRepositoryPort;
    lead: LeadRepositoryPort;
  };
}>;

export function makeProjectsAppContext(deps: ProjectsAppContext): ProjectsAppContext {
  return deps;
}



