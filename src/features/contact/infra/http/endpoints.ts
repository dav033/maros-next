import { api, buildCrudEndpoints } from "@/shared/infra";

const BASE = api.resource("contacts");

export const contactEndpoints = {
  ...buildCrudEndpoints<number>(BASE, { listPath: "/all" }),
  uniquenessCheck: () => `${BASE}/validate`,
  search: (q: string) => `${BASE}/search?q=${encodeURIComponent(q)}`,
} as const;
