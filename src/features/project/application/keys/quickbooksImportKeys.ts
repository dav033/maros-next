import { projectsKeys } from "./projectsKeys";

/**
 * La lista de jobs cuelga de `projects` porque el backend la sirve bajo
 * `/projects/quickbooks-import`: importar toca proyectos y leads, así que la
 * invalidación tiene que arrastrar las dos ramas.
 */
export const quickbooksImportKeys = {
  all: [...projectsKeys.all, "quickbooks-import"] as const,
  jobs: () => [...quickbooksImportKeys.all, "jobs"] as const,
} as const;
