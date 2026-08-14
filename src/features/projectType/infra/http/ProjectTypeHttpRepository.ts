import type { ProjectType, ProjectTypeRepositoryPort } from "@/features/projectType/domain";
import type { HttpClientLike } from "@/shared/infra";
import { api, optimizedApiClient } from "@/shared/infra";

/**
 * Takes an injected client (same shape as LeadHttpRepository/ContactHttpRepository).
 * It used to hardcode `optimizedApiClient`, which is a browser client: constructed
 * from a Server Component or a server action it sent no session cookie, so
 * `/project-types/all` came back 401 and the caller's `.catch(() => [])` turned that
 * into an empty list — which is what left the "Project type" select with nothing to
 * pick. Server-side callers must pass createServerApiClient(await headers()).
 */
export class ProjectTypeHttpRepository implements ProjectTypeRepositoryPort {
  constructor(private readonly client: HttpClientLike = optimizedApiClient) {}

  async findAll(): Promise<ProjectType[]> {
    const url = api.path("project-types", "all");
    const res = await this.client.get<ProjectType[]>(url);
    const data = Array.isArray(res.data) ? res.data : [];
    return data;
  }
}
