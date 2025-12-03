export { api, API_BASE } from "./apiRoutes";
export { buildCrudEndpoints } from "./buildCrudEndpoints";

// Resource Repository API
export type { 
  ResourceRepository, 
  ResourceEndpoints,
  MakeHttpResourceRepositoryConfig 
} from "./resourceRepository";
export { makeHttpResourceRepository } from "./resourceRepository";
