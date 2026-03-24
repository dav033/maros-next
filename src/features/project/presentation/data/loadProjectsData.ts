import { unstable_cache } from "next/cache";
import { serverApiClient } from "@/shared/infra/http";
import { ProjectHttpRepository, makeProjectsAppContext } from "@/project";
import { LeadHttpRepository } from "@/leads";
import { listProjects } from "@/project/application";
import type { Project } from "@/project/domain";

export interface ProjectsPageData {
  projects: Project[];
}

async function fetchProjectsData(): Promise<ProjectsPageData> {
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

export const loadProjectsData = unstable_cache(
  fetchProjectsData,
  ["projects-page-data"],
  { revalidate: 60 }
);
