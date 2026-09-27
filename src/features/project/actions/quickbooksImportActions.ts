"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerApiClient } from "@/shared/infra/http";
import type { ActionResult } from "@/shared/actions/types";
import { handleActionError, success } from "@/shared/actions/utils";

export interface QuickbooksImportMatch {
  leadId: number;
  leadNumber: string | null;
  name: string | null;
  projectId: number | null;
  qboCustomerId: string | null;
}

export interface QuickbooksImportJob {
  qboCustomerId: string;
  displayName: string;
  fullyQualifiedName: string;
  active: boolean;
  balance: number;
  parentName: string | null;
  projectNumber: string | null;
  importedProjectId: number | null;
  matchingLeads: QuickbooksImportMatch[];
}

export interface QuickbooksImportInput {
  qboCustomerId: string;
  projectNumber: string;
  name?: string;
  location?: string;
  leadId?: number;
  projectId?: number;
}

export interface QuickbooksImportResult {
  projectId: number;
  leadId: number;
  qboCustomerId: string;
  alreadyImported: boolean;
}

export async function getQuickbooksImportJobsAction(): Promise<ActionResult<QuickbooksImportJob[]>> {
  try {
    const api = createServerApiClient(await headers());
    const { data } = await api.get<QuickbooksImportJob[]>("/projects/quickbooks-import/jobs");
    return success(data ?? []);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function importQuickbooksJobAction(
  input: QuickbooksImportInput,
): Promise<ActionResult<QuickbooksImportResult>> {
  try {
    const api = createServerApiClient(await headers());
    const { data } = await api.post<QuickbooksImportResult>(
      "/projects/quickbooks-import/import",
      input,
    );
    if (!data) throw new Error("QuickBooks import returned an empty response");
    revalidatePath("/projects", "layout");
    return success(data);
  } catch (error) {
    return handleActionError(error);
  }
}
