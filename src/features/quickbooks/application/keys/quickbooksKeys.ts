export const quickbooksKeys = {
  all: ["quickbooks"] as const,
  projectAttachments: (
    projectNumber: string,
    includeTempDownloadUrl?: boolean,
  ) =>
    [
      ...quickbooksKeys.all,
      "project-attachments",
      projectNumber,
      includeTempDownloadUrl ? "with-urls" : "metadata",
    ] as const,
  attachmentDownloadUrl: (attachmentId: string) =>
    [...quickbooksKeys.all, "attachment-download-url", attachmentId] as const,
} as const;
