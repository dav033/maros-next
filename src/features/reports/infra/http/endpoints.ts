import { api } from "@/shared/infra";

const BASE = api.resource("reports");

export const reportEndpoints = {
  restorationVisit: {
    get: (projectId: number | string) =>
      `${BASE}/restoration-visit?projectId=${encodeURIComponent(projectId)}`,
    submit: () => `${BASE}/restoration-visit`,
  },
  restorationFinal: {
    get: (projectId: number | string) =>
      `${BASE}/restoration-final?projectId=${encodeURIComponent(projectId)}`,
    submit: () => `${BASE}/restoration-final`,
  },
} as const;







