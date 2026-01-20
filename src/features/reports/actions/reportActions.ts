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
    console.log("Uploading image to webhook:", IMAGE_UPLOAD_WEBHOOK_URL);
    
    const response = await fetch(IMAGE_UPLOAD_WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });

    console.log("Image upload response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Image upload error details:", {
        url: IMAGE_UPLOAD_WEBHOOK_URL,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        errorText: errorText,
      });
      return failure(
        `Webhook request failed: ${response.statusText} - ${errorText}`
      );
    }

    const responseData = await response.json().catch((parseError) => {
      console.error("Error parsing JSON response:", {
        parseError: parseError,
        responseStatus: response.status,
        responseStatusText: response.statusText,
      });
      return {};
    });
    
    console.log("Image upload response data:", responseData);
    
    const imageId = responseData.imageId || null;

    if (!imageId) {
      console.error("No imageId in response:", {
        responseData: responseData,
        url: IMAGE_UPLOAD_WEBHOOK_URL,
      });
      return failure("No imageId returned from webhook");
    }

    console.log("Image uploaded successfully, imageId:", imageId);
    return success(imageId);
  } catch (error) {
    console.error("Image upload exception:", {
      error: error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      url: IMAGE_UPLOAD_WEBHOOK_URL,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });
    return handleActionError(error);
  }
}

export async function submitDocumentAction(
  payload: DocumentPayload
): Promise<ActionResult<string>> {
  try {
    console.log("Submitting document to webhook:", DOCUMENT_PROCESSING_WEBHOOK_URL);
    console.log("Document payload:", {
      docId: payload.docId,
      language: payload.language,
      project_number: payload.project_number,
      project_name: payload.project_name,
      activitiesCount: payload.activities.length,
      additionalActivitiesCount: payload.additionalActivities.length,
      observationsCount: payload.observations.length,
      nextActivitiesCount: payload.nextActivities.length,
    });

    const response = await fetch(DOCUMENT_PROCESSING_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Document submit response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Document submit error details:", {
        url: DOCUMENT_PROCESSING_WEBHOOK_URL,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        errorText: errorText,
        payload: payload,
      });
      return failure(
        `Webhook request failed: ${response.statusText} - ${errorText}`
      );
    }

    const responseData = await response.json().catch((parseError) => {
      console.error("Error parsing JSON response:", {
        parseError: parseError,
        responseStatus: response.status,
        responseStatusText: response.statusText,
      });
      return {};
    });

    console.log("Document submit response data:", responseData);

    const docUrl = responseData.docUrl || null;

    if (!docUrl) {
      console.error("No docUrl in response:", {
        responseData: responseData,
        url: DOCUMENT_PROCESSING_WEBHOOK_URL,
        payload: payload,
      });
      return failure("No docUrl returned from webhook");
    }

    console.log("Document submitted successfully, docUrl:", docUrl);
    return success(docUrl);
  } catch (error) {
    console.error("Document submit exception:", {
      error: error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      url: DOCUMENT_PROCESSING_WEBHOOK_URL,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      payload: payload,
    });
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
    console.log("Sending email to webhook:", SEND_EMAIL_WEBHOOK_URL);
    console.log("Email payload:", {
      emails: payload.emails,
      emailsCount: payload.emails.length,
      projectNumber: payload.projectNumber,
      projectName: payload.projectName,
    });

    const response = await fetch(SEND_EMAIL_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Send email response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Send email error details:", {
        url: SEND_EMAIL_WEBHOOK_URL,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        errorText: errorText,
        payload: payload,
      });
      return failure(
        `Email send failed: ${response.statusText} - ${errorText}`
      );
    }

    const responseData = await response.json().catch(() => ({}));
    console.log("Send email response data:", responseData);

    console.log("Email sent successfully");
    return success(undefined);
  } catch (error) {
    console.error("Send email exception:", {
      error: error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      url: SEND_EMAIL_WEBHOOK_URL,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      payload: payload,
    });
    return handleActionError(error);
  }
}

