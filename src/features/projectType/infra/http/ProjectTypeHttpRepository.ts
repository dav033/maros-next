import type { ProjectType, ProjectTypeRepositoryPort } from "@/projectType";
import { api, optimizedApiClient } from "@/shared";

export class ProjectTypeHttpRepository implements ProjectTypeRepositoryPort {
  async findAll(): Promise<ProjectType[]> {
    const url = api.path("project-types", "all");
    const res = await optimizedApiClient.get<ProjectType[]>(url);
    const data = Array.isArray(res.data) ? res.data : [];
    return data;
  }
}
