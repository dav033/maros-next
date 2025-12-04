import type { ProjectTypesAppContext } from "@/projectType/application";
import type { ProjectType } from "@/projectType/domain";

export async function listProjectTypes(
  ctx: ProjectTypesAppContext
): Promise<ProjectType[]> {
  const repo = ctx?.repos?.projectType;
  if (!repo) {
    throw new Error("ProjectType repository not configured in ProjectTypesAppContext");
  }
  const items = await repo.findAll();
  return Array.isArray(items) ? items : [];
}
