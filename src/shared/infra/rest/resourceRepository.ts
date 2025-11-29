export interface ResourceRepository<ID, Entity, Draft, Patch> {
  getById(id: ID): Promise<Entity | null>;
  list(params?: unknown): Promise<Entity[]>;
  create(draft: Draft): Promise<Entity>;
  update(id: ID, patch: Patch): Promise<Entity>;
  delete(id: ID): Promise<void>;
}

export type ResourceEndpoints<ID> = {
  base: string;
  getById: (id: ID) => string;
  list?: () => string;
  create: () => string;
  update: (id: ID) => string;
  remove: (id: ID) => string;
};

export type ResourceMappers<ApiDto, Entity, Draft, Patch, CreateDto, UpdateDto> = {
  fromApi: (dto: ApiDto) => Entity;
  fromApiList?: (dtos: ApiDto[]) => Entity[];
  toCreateDto?: (draft: Draft) => CreateDto;
  toUpdateDto?: (patch: Patch) => UpdateDto;
};

export type MakeHttpResourceRepositoryConfig<
  ID,
  ApiDto,
  Entity,
  Draft,
  Patch,
  CreateDto = Draft,
  UpdateDto = Patch
> = {
  endpoints: ResourceEndpoints<ID>;
  mappers: ResourceMappers<ApiDto, Entity, Draft, Patch, CreateDto, UpdateDto>;
  api: {
    get<T>(url: string): Promise<{ data: T }>;
    post<T>(url: string, body: unknown): Promise<{ data: T }>;
    put<T>(url: string, body: unknown): Promise<{ data: T }>;
    delete<T>(url: string): Promise<{ data?: T }>;
  };
};

export function makeHttpResourceRepository<
  ID,
  ApiDto,
  Entity,
  Draft,
  Patch,
  CreateDto = Draft,
  UpdateDto = Patch
>(
  config: MakeHttpResourceRepositoryConfig<ID, ApiDto, Entity, Draft, Patch, CreateDto, UpdateDto>
): ResourceRepository<ID, Entity, Draft, Patch> {
  const { endpoints, mappers, api } = config;
  const fromApi = mappers.fromApi;
  const fromApiList = mappers.fromApiList ?? ((dtos: ApiDto[]) => dtos.map(fromApi));
  const toCreateDto = mappers.toCreateDto ?? ((draft: Draft) => draft as unknown as CreateDto);
  const toUpdateDto = mappers.toUpdateDto ?? ((patch: Patch) => patch as unknown as UpdateDto);

  return {
    async getById(id: ID): Promise<Entity | null> {
      const { data } = await api.get<ApiDto | null>(endpoints.getById(id));
      return data ? fromApi(data) : null;
    },

    async list(params?: unknown): Promise<Entity[]> {
      const url = endpoints.list ? endpoints.list() : endpoints.base;
      const { data } = await api.get<ApiDto[]>(url);
      return Array.isArray(data) ? fromApiList(data) : [];
    },

    async create(draft: Draft): Promise<Entity> {
      const dto = toCreateDto(draft);
      const { data } = await api.post<ApiDto>(endpoints.create(), dto);
      if (!data) throw new Error("Empty response on create");
      return fromApi(data);
    },

    async update(id: ID, patch: Patch): Promise<Entity> {
      const dto = toUpdateDto(patch);
      console.log("[resourceRepository.update] Patch:", patch);
      console.log("[resourceRepository.update] Mapped DTO:", dto);
      console.log("[resourceRepository.update] Endpoint:", endpoints.update(id));
      console.log("[resourceRepository.update] Sending PUT request with body:", JSON.stringify(dto, null, 2));
      const { data } = await api.put<ApiDto>(endpoints.update(id), dto);
      console.log("[resourceRepository.update] Response data:", data);
      if (!data) throw new Error("Empty response on update");
      const result = fromApi(data);
      console.log("[resourceRepository.update] Mapped result:", result);
      return result;
    },

    async delete(id: ID): Promise<void> {
      await api.delete<void>(endpoints.remove(id));
    },
  };
}
