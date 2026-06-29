import { api } from "@/shared/infra/rest";

const BASE = api.resource("quickbooks");

export const quickbooksEndpoints = {
  projectAttachments: (projectNumber: string) =>
    `${BASE}/projects/${encodeURIComponent(projectNumber)}/attachments`,
  attachmentDownloadUrl: (attachmentId: string) =>
    `${BASE}/attachments/${encodeURIComponent(attachmentId)}/download-url`,
} as const;
