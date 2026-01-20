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
    console.log("uploadImages called with:", {
      totalFiles: filesWithMetadata.length,
      files: filesWithMetadata.map(item => ({
        fileName: item.file.name,
        fileSize: item.file.size,
        fileType: item.file.type,
        activityType: item.activityType,
        activityIndex: item.activityIndex,
        activityText: item.activityText,
      })),
      reportData: reportData,
    });

    const imageIdsByActivity: Array<{
      activityType: string;
      activityIndex: number;
      imageIds: string[];
    }> = [];

    for (let i = 0; i < filesWithMetadata.length; i++) {
      const item = filesWithMetadata[i];
      try {
        console.log(`Uploading image ${i + 1}/${filesWithMetadata.length}:`, {
          fileName: item.file.name,
          activityType: item.activityType,
          activityIndex: item.activityIndex,
        });

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
          console.log(`Image ${i + 1} uploaded successfully:`, {
            imageId: imageId,
            fileName: item.file.name,
          });
        } else {
          console.warn(`Image ${i + 1} returned null imageId:`, {
            fileName: item.file.name,
          });
        }
      } catch (error) {
        console.error(`Error uploading image ${i + 1}/${filesWithMetadata.length}:`, {
          error: error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          fileName: item.file.name,
          activityType: item.activityType,
          activityIndex: item.activityIndex,
          fileSize: item.file.size,
          fileType: item.file.type,
        });
        throw error;
      }
    }

    console.log("All images uploaded, result:", {
      imageIdsByActivity: imageIdsByActivity,
      totalUploaded: imageIdsByActivity.reduce((sum, entry) => sum + entry.imageIds.length, 0),
    });

    return imageIdsByActivity;
  };

  const submitReport = async (
    form: RestorationVisitReport,
    leadNumber: string,
    activitiesWithImageIds: ActivityRow[],
    additionalActivitiesWithImageIds: ActivityRow[]
  ): Promise<string | null> => {
    console.log("submitReport called with:", {
      leadNumber: leadNumber,
      projectNumber: form.projectNumber,
      language: form.language,
      activitiesCount: activitiesWithImageIds.length,
      additionalActivitiesCount: additionalActivitiesWithImageIds.length,
      observationsCount: form.observations.length,
      nextActivitiesCount: form.nextActivities.length,
    });

    try {
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

      console.log("submitReport payload prepared:", {
        docId: payload.docId,
        activitiesCount: payload.activities.length,
        totalImageIds: payload.activities.reduce((sum, act) => sum + act.imageIds.length, 0) +
          payload.additionalActivities.reduce((sum, act) => sum + act.imageIds.length, 0),
      });

      const docUrl = await sendDocumentToWebhook(payload);

      console.log("submitReport completed successfully:", {
        docUrl: docUrl,
        docId: payload.docId,
      });

      return docUrl;
    } catch (error) {
      console.error("submitReport error:", {
        error: error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        leadNumber: leadNumber,
        projectNumber: form.projectNumber,
      });
      throw error;
    }
  };

  return {
    uploading,
    setUploading,
    collectFilesWithMetadata,
    uploadImages,
    submitReport,
  };
};

