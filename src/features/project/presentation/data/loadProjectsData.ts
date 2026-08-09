import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { ProjectHttpRepository, makeProjectsAppContext } from "@/project";
import { LeadHttpRepository } from "@/leads";
import { listProjects } from "@/project/application";
import type { Project } from "@/project/domain";

export interface ProjectsPageData {
  projects: Project[];
}

async function fetchProjectsData(): Promise<ProjectsPageData> {
  const apiClient = createServerApiClient(await headers());
  const ctx = makeProjectsAppContext({
    repos: {
      project: new ProjectHttpRepository(apiClient),
      lead: new LeadHttpRepository(apiClient),
    },
  });

  const projects = await listProjects(ctx).catch((err) => {
    console.error("[loadProjectsData] Failed to fetch projects:", err);
    return [];
  });

  return {
    projects: projects ?? [],
  };
}

export const loadProjectsData = fetchProjectsData;
