import { api, buildCrudEndpoints } from "@/shared/infra";

const BASE = api.resource("tasks");

export const endpoints = {
  ...buildCrudEndpoints<number>(BASE),
  board: () => `${BASE}/board`,
  mine: () => `${BASE}/mine`,
  byEntity: () => `${BASE}/by-entity`,
  labels: () => `${BASE}/labels`,
  label: (labelId: number) => `${BASE}/labels/${labelId}`,
  move: (id: number) => `${BASE}/${id}/move`,
  assignee: (id: number) => `${BASE}/${id}/assignee`,
  setLabels: (id: number) => `${BASE}/${id}/labels`,
  entity: (id: number) => `${BASE}/${id}/entity`,
} as const;
