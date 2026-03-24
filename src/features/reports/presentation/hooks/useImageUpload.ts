import { useState } from "react";
import { toast } from "sonner";
import type { ActivityRow } from "@/reports/domain/models";
import {
  uploadImageToWebhook,
  sendDocumentToWebhook,
  type ImageUploadMetadata,
  type ReportData,
  type DocumentPayload,
} from "../services/webhookService";
import type { RestorationVisitReport } from "@/reports/domain/models";

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const collectFilesWithMetadata = (
    activities: ActivityRow[],
    additionalActivities: ActivityRow[]
  ) => {
    const filesWithMetadata: Array<{
      file: File;
      activityType: string;
      activityIndex: number;
      activityText: string;
    }> = [];

    activities.forEach((row, index) => {
      row.imageFiles?.forEach((file) => {
        filesWithMetadata.push({
          file,
          activityType: "activity",
          activityIndex: index,
          activityText: row.activity ?? "",
        });
      });
    });

    additionalActivities.forEach((row, index) => {
      row.imageFiles?.forEach((file) => {
        filesWithMetadata.push({
          file,
          activityType: "additionalActivity",
          activityIndex: index,
          activityText: row.activity ?? "",
        });
      });
    });

    return filesWithMetadata;
  };

  const uploadImages = async (
    filesWithMetadata: Array<{
      file: File;
      activityType: string;
      activityIndex: number;
      activityText: string;
    }>,
    reportData: ReportData
  ): Promise<Array<{ activityType: string; activityIndex: number; imageIds: string[] }>> => {
    const imageIdsByActivity: Array<{
      activityType: string;
      activityIndex: number;
      imageIds: string[];
    }> = [];

    for (let i = 0; i < filesWithMetadata.length; i++) {
      const item = filesWithMetadata[i];
      try {
        const metadata: ImageUploadMetadata = {
          activityType: item.activityType,
          activityIndex: item.activityIndex,
          activityText: item.activityText,
          originalFileName: item.file.name,
          fileSize: item.file.size,
          fileType: item.file.type,
        };

        const imageId = await uploadImageToWebhook(item.file, metadata, reportData);

        if (imageId) {
          let activityEntry = imageIdsByActivity.find(
            (entry) =>
              entry.activityType === item.activityType &&
              entry.activityIndex === item.activityIndex
          );

          if (!activityEntry) {
            activityEntry = {
              activityType: item.activityType,
              activityIndex: item.activityIndex,
              imageIds: [],
            };
            imageIdsByActivity.push(activityEntry);
          }

          activityEntry.imageIds.push(imageId);
        }
      } catch (error) {
        throw error;
      }
    }

    return imageIdsByActivity;
  };

  const submitReport = async (
    form: RestorationVisitReport,
    leadNumber: string,
    activitiesWithImageIds: ActivityRow[],
    additionalActivitiesWithImageIds: ActivityRow[]
  ): Promise<string | null> => {
    const payload: DocumentPayload = {
      docId: form.projectNumber || leadNumber,
      language: form.language || "es",
      project_number: form.projectNumber || leadNumber,
      project_name: form.projectName || "",
      project_location: form.projectLocation || "",
      client_name: form.clientName || "",
      customer_name: form.customerName || "",
      email: form.email || "",
      phone: form.phone || "",
      date_started: form.dateStarted ?? null,
      date_report: new Date().toISOString().split("T")[0],
      overview: form.overview || "",
      activities: activitiesWithImageIds
        .filter((act) => act.activity?.trim())
        .map((act) => ({
          activity: act.activity,
          imageIds: act.imageIds || [],
        })),
      observations: form.observations
        .filter((obs) => obs?.trim())
        .map((obs) => ({ value: obs })),
      nextActivities: form.nextActivities
        .filter((item) => item?.trim())
        .map((item) => ({ value: item })),
      additionalActivities: additionalActivitiesWithImageIds
        .filter((act) => act.activity?.trim())
        .map((act) => ({
          activity: act.activity,
          imageIds: act.imageIds || [],
        })),
    };

    return await sendDocumentToWebhook(payload);
  };

  return {
    uploading,
    setUploading,
    collectFilesWithMetadata,
    uploadImages,
    submitReport,
  };
};
