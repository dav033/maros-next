import type { ApiProjectDTO } from "@/project/domain/services/projectReadMapper";
import type { Project, ProjectDraft, ProjectPatch } from "@/project/domain/models";
import type { ProjectRepositoryPort } from "@/project/domain/ports";
import { optimizedApiClient } from "@/shared/infra/http";
import { makeHttpResourceRepository } from "@/shared/infra/rest";
import type { ResourceRepository } from "@/shared/infra/rest";
import type { HttpClientLike } from "@/shared/infra/http";

import { endpoints as projectEndpoints } from "./endpoints";
import {
  type CreateProjectPayload,
  type UpdateProjectPayload,
  mapProjectDraftToCreatePayload,
  mapProjectFromApi,
  mapProjectPatchToUpdatePayload,
  mapProjectsFromApi,
} from "./mappers";

export class ProjectHttpRepository implements ProjectRepositoryPort {
  private readonly resource: ResourceRepository<number, Project, ProjectDraft, ProjectPatch>;

  constructor(private readonly api: HttpClientLike = optimizedApiClient) {
    this.resource = makeHttpResourceRepository<number, ApiProjectDTO, Project, ProjectDraft, ProjectPatch>({
      endpoints: projectEndpoints,
      mappers: { fromApi: mapProjectFromApi, fromApiList: mapProjectsFromApi },
      api: this.api,
    });
  }

  getById = (id: number) => this.resource.getById(id);
  list = () => this.resource.list();
  delete = (id: number) => this.resource.delete(id);

  create = async (draft: ProjectDraft): Promise<Project> => {
    const payload: CreateProjectPayload = mapProjectDraftToCreatePayload(draft);
    const { data } = await this.api.post<ApiProjectDTO>(
      projectEndpoints.create(),
      payload
    );
    if (!data) throw new Error("Empty response creating Project");
    return mapProjectFromApi(data);
  };

  update = async (id: number, patch: ProjectPatch): Promise<Project> => {
    const payload = mapProjectPatchToUpdatePayload(patch);
    const url = projectEndpoints.update(id);
    const { data } = await this.api.put<ApiProjectDTO>(url, payload);
    if (!data) throw new Error("Empty response updating Project");
    return mapProjectFromApi(data);
  };
}

