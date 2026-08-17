import { api, buildCrudEndpoints } from "@/shared/infra";

const BASE = api.resource("tasks");
const TEMPLATE_BASE = api.resource("task-templates");
const SAVED_VIEW_BASE = api.resource("task-saved-views");

export const endpoints = {
  ...buildCrudEndpoints<number>(BASE),
  board: () => `${BASE}/board`,
  mine: () => `${BASE}/mine`,
  archived: () => `${BASE}/archived`,
  schedule: () => `${BASE}/schedule`,
  templates: () => TEMPLATE_BASE,
  applyTemplate: (templateId: number) => `${TEMPLATE_BASE}/${templateId}/apply`,
  savedViews: () => SAVED_VIEW_BASE,
  savedView: (id: number) => `${SAVED_VIEW_BASE}/${id}`,
  byEntity: () => `${BASE}/by-entity`,
  byParty: () => `${BASE}/by-party`,
  labels: () => `${BASE}/labels`,
  label: (labelId: number) => `${BASE}/labels/${labelId}`,
  move: (id: number) => `${BASE}/${id}/move`,
  scheduleTask: (id: number) => `${BASE}/${id}/schedule`,
  reorderSubtask: (id: number) => `${BASE}/${id}/reorder`,
  assignee: (id: number) => `${BASE}/${id}/assignee`,
  setLabels: (id: number) => `${BASE}/${id}/labels`,
  entity: (id: number) => `${BASE}/${id}/entity`,
  parties: (id: number) => `${BASE}/${id}/parties`,
  watchers: (id: number) => `${BASE}/${id}/watchers`,
  watcher: (id: number, userId: number) => `${BASE}/${id}/watchers/${userId}`,
  archive: (id: number) => `${BASE}/${id}/archive`,
  restore: (id: number) => `${BASE}/${id}/restore`,
  dependencies: (id: number) => `${BASE}/${id}/dependencies`,
  timerStart: (id: number) => `${BASE}/${id}/timer/start`,
  timerStop: (id: number) => `${BASE}/${id}/timer/stop`,
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
