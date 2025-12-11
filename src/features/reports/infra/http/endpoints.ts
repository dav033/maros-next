import { api } from "@/shared/infra";

const BASE = api.resource("reports");

export const reportEndpoints = {
  restorationVisit: {
    get: (leadNumber: string) =>
      `${BASE}/restoration-visit?leadNumber=${encodeURIComponent(leadNumber)}`,
    submit: () => `${BASE}/restoration-visit`,
  },
  restorationFinal: {
    get: (leadNumber: string) =>
      `${BASE}/restoration-final?leadNumber=${encodeURIComponent(leadNumber)}`,
    submit: () => `${BASE}/restoration-final`,
  },
} as const;







