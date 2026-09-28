import { api } from "@/shared/infra/rest";

const BASE = api.resource("quickbooks");
// El vínculo vive en el proyecto, no en QuickBooks: el backend lo expone bajo /projects.
const PROJECTS_BASE = api.resource("projects");

export const quickbooksEndpoints = {
  projectAttachments: (projectNumber: string) =>
    `${BASE}/projects/${encodeURIComponent(projectNumber)}/attachments`,
  attachmentDownloadUrl: (attachmentId: string) =>
    `${BASE}/attachments/${encodeURIComponent(attachmentId)}/download-url`,
  connectionStatus: () => `${BASE}/connection-status`,
  projectQboLink: (projectId: number) => `${PROJECTS_BASE}/${projectId}/qbo-link`,
} as const;
