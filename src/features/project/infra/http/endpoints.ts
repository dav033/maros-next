import { api, buildCrudEndpoints } from "@/shared/infra/rest";

const BASE = api.resource("projects");

export const endpoints = {
  ...buildCrudEndpoints<number>(BASE, {
    listPath: "/all",
  }),
  details: (id: number | string) => `${BASE}/${id}/details`,
} as const;

