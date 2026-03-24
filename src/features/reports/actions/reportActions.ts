"use server";

import type { ActionResult } from "@/shared/actions/types";
import { success, failure, handleActionError } from "@/shared/actions/utils";

const IMAGE_UPLOAD_WEBHOOK_URL =
  "https://n8n.marosconstruction.com/webhook/90601da6-4544-471d-8e0c-ecbde6631dc8";

const DOCUMENT_PROCESSING_WEBHOOK_URL =
  "https://n8n.marosconstruction.com/webhook/87c85188-f421-4725-9b1c-be59a4eabae7";

const SEND_EMAIL_WEBHOOK_URL =
  "https://n8n-jfl9.onrender.com/webhook-test/d421c1ae-4d7e-4ad5-8129-620217cf7c06";

export interface ImageUploadMetadata {
  activityType: string;
  activityIndex: number;
  activityText: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
}

export interface ReportData {
  leadNumber: string;
  projectNumber: string;
  projectName: string;
  projectLocation: string;
  clientName: string;
  customerName: string;
  email: string;
  phone: string;
  dateStarted: string | null;
  language: string;
  overview: string;
}

export interface DocumentPayload {
  docId: string;
  language: string;
  project_number: string;
  project_name: string;
  project_location: string;
  client_name: string;
  customer_name: string;
  email: string;
  phone: string;
  date_started: string | null;
  date_report: string;
  overview: string;
  activities: Array<{ activity: string; imageIds: string[] }>;
  observations: Array<{ value: string }>;
  nextActivities: Array<{ value: string }>;
  additionalActivities: Array<{ activity: string; imageIds: string[] }>;
}

export async function uploadImageAction(
  formData: FormData
): Promise<ActionResult<string>> {
  try {
    const response = await fetch(IMAGE_UPLOAD_WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return failure(
        `Webhook request failed: ${response.statusText} - ${errorText}`
      );
    }

    const responseData = await response.json().catch(() => ({}));
    const imageId = responseData.imageId || null;

    if (!imageId) {
      return failure("No imageId returned from webhook");
    }

    return success(imageId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function submitDocumentAction(
  payload: DocumentPayload
): Promise<ActionResult<string>> {
  try {
    const response = await fetch(DOCUMENT_PROCESSING_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return failure(
        `Webhook request failed: ${response.statusText} - ${errorText}`
      );
    }

    const responseData = await response.json().catch(() => ({}));
    const docUrl = responseData.docUrl || null;

    if (!docUrl) {
      return failure("No docUrl returned from webhook");
    }

    return success(docUrl);
  } catch (error) {
    return handleActionError(error);
  }
}

export interface SendEmailPayload {
  emails: string[];
  docUrl: string;
  projectNumber: string;
  projectName: string;
  customerName: string;
}

export async function sendEmailAction(
  payload: SendEmailPayload
): Promise<ActionResult<void>> {
  try {
    const response = await fetch(SEND_EMAIL_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return failure(
        `Email send failed: ${response.statusText} - ${errorText}`
      );
    }

    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}
