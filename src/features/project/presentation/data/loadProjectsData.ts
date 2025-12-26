import { serverApiClient } from "@/shared/infra/http";
import { ProjectHttpRepository, makeProjectsAppContext } from "@/project";
import { LeadHttpRepository } from "@/leads";
import { listProjects } from "@/project/application";
import type { Project } from "@/project/domain";

export interface ProjectsPageData {
  projects: Project[];
}

export async function loadProjectsData(): Promise<ProjectsPageData> {
  const ctx = makeProjectsAppContext({
    repos: {
      project: new ProjectHttpRepository(serverApiClient),
      lead: new LeadHttpRepository(serverApiClient),
    },
  });

  const projects = await listProjects(ctx).catch(() => []);

  return {
    projects: projects ?? [],
  };
}

