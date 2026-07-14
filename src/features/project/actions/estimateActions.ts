"use server";

import { serverApiClient } from "@/shared/infra/http";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";
import { AppError } from "@/shared/errors";
import { endpoints } from "@/features/project/infra/http/endpoints";

export interface EstimateFileInfo {
  key: string;
  fileName: string;
}

type EstimateFileResponse =
  | { found: true; key: string; fileName: string }
  | { found: false };

export async function getProjectEstimateFileAction(
  projectId: number,
): Promise<ActionResult<EstimateFileInfo | null>> {
  try {
    const { data } = await serverApiClient.get<EstimateFileResponse | null>(
      endpoints.estimateFile(projectId),
    );

    if (!data || !data.found) {
      return success(null);
    }

    return success({ key: data.key, fileName: data.fileName });
  } catch (error) {
    const appError = AppError.from(error);
    if (appError.status === 404 || appError.kind === "not_found") {
      return success(null);
    }
    return handleActionError(appError);
  }
}

export interface UpdateEstimateResult {
  estimate: unknown;
  financial: { estimatedAmount?: number } | null;
}

/**
 * Actualiza el valor del estimate del proyecto desde la plataforma. El backend
 * lo sincroniza con QuickBooks (reescribe el estimate más reciente a una única
 * línea con ese total, o crea uno si no existe).
 */
export async function updateProjectEstimateAction(
  projectId: number,
  amount: number,
): Promise<ActionResult<UpdateEstimateResult>> {
  try {
    const { data } = await serverApiClient.patch<UpdateEstimateResult>(
      endpoints.estimate(projectId),
      { amount },
    );
    return success(data);
  } catch (error) {
    return handleActionError(error);
  }
}

export interface SendEstimateEmailInput {
  recipients: string[];
  cc?: string[];
  includeAttachment: boolean;
  attachmentKey?: string;
  subject?: string;
  message?: string;
}

export type SendEstimateEmailResult =
  | { sent: true; attached: boolean; recipients: string[] }
  | { sent: false; reason: "ESTIMATE_NOT_FOUND" };

export async function sendProjectEstimateEmailAction(
  projectId: number,
  input: SendEstimateEmailInput,
): Promise<ActionResult<SendEstimateEmailResult>> {
  try {
    const { data } = await serverApiClient.post<SendEstimateEmailResult>(
      endpoints.sendEstimateEmail(projectId),
      input,
    );
    return success(data);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function appendProjectAttachmentAction(
  projectId: number,
  key: string,
): Promise<ActionResult<string[]>> {
  try {
    const { data } = await serverApiClient.get<{ attachments?: string[] | null }>(
      endpoints.details(projectId),
    );
    const existing = Array.isArray(data?.attachments)
      ? data.attachments.filter((item): item is string => typeof item === "string")
      : [];
    const attachments = Array.from(new Set([...existing, key]));
    await serverApiClient.put(endpoints.update(projectId), { attachments });
    return success(attachments);
  } catch (error) {
    return handleActionError(error);
  }
}
