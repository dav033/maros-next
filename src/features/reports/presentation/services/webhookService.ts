// Re-export types and interfaces for backward compatibility
export type {
  ImageUploadMetadata,
  ReportData,
  DocumentPayload,
} from "../../actions/reportActions";

import {
  uploadImageAction,
  submitDocumentAction,
  type ImageUploadMetadata,
  type ReportData,
  type DocumentPayload,
} from "../../actions/reportActions";

export const uploadImageToWebhook = async (
  file: File,
  activityMetadata: ImageUploadMetadata,
  reportData: ReportData
): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("activityMetadata", JSON.stringify(activityMetadata));
  formData.append("reportData", JSON.stringify(reportData));

  const result = await uploadImageAction(formData);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
};

export const sendDocumentToWebhook = async (
  payload: DocumentPayload
): Promise<string | null> => {
  const result = await submitDocumentAction(payload);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
};
