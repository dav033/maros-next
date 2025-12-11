import type { Project } from "@/project/domain";
import type { ProjectsAppContext } from "../../context";

export async function listProjects(
  ctx: ProjectsAppContext
): Promise<Project[]> {
  return ctx.repos.project.list();
}



