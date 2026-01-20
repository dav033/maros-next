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
  console.log("uploadImageToWebhook called with:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    activityMetadata: activityMetadata,
    reportData: reportData,
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("activityMetadata", JSON.stringify(activityMetadata));
  formData.append("reportData", JSON.stringify(reportData));

  try {
    const result = await uploadImageAction(formData);

    if (!result.success) {
      console.error("uploadImageToWebhook failed:", {
        error: result.error,
        fileName: file.name,
        activityMetadata: activityMetadata,
      });
      throw new Error(result.error);
    }

    console.log("uploadImageToWebhook success:", {
      imageId: result.data,
      fileName: file.name,
    });

    return result.data;
  } catch (error) {
    console.error("uploadImageToWebhook exception:", {
      error: error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      fileName: file.name,
      activityMetadata: activityMetadata,
    });
    throw error;
  }
};

export const sendDocumentToWebhook = async (
  payload: DocumentPayload
): Promise<string | null> => {
  console.log("sendDocumentToWebhook called with:", {
    docId: payload.docId,
    language: payload.language,
    project_number: payload.project_number,
    project_name: payload.project_name,
    activitiesCount: payload.activities.length,
    additionalActivitiesCount: payload.additionalActivities.length,
  });

  try {
    const result = await submitDocumentAction(payload);

    if (!result.success) {
      console.error("sendDocumentToWebhook failed:", {
        error: result.error,
        payload: payload,
      });
      throw new Error(result.error);
    }

    console.log("sendDocumentToWebhook success:", {
      docUrl: result.data,
      docId: payload.docId,
    });

    return result.data;
  } catch (error) {
    console.error("sendDocumentToWebhook exception:", {
      error: error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      payload: payload,
    });
    throw error;
  }
};

