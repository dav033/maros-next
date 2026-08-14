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
  reorderSubtask: (id: number) => `${BASE}/${id}/reorder`,
  assignee: (id: number) => `${BASE}/${id}/assignee`,
  setLabels: (id: number) => `${BASE}/${id}/labels`,
  entity: (id: number) => `${BASE}/${id}/entity`,
  attachments: (id: number) => `${BASE}/${id}/attachments`,
  attachmentsRemove: (id: number) => `${BASE}/${id}/attachments/remove`,
  attachmentsOrder: (id: number) => `${BASE}/${id}/attachments/order`,
  comments: (id: number) => `${BASE}/${id}/comments`,
  comment: (id: number, commentId: number) => `${BASE}/${id}/comments/${commentId}`,
  bulkAssignee: () => `${BASE}/bulk/assignee`,
  bulkStatus: () => `${BASE}/bulk/status`,
  bulkLabels: () => `${BASE}/bulk/labels`,
  bulkDelete: () => `${BASE}/bulk/delete`,
} as const;
