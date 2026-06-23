"use client";

import { useQuery } from "@tanstack/react-query";
import { useQuickbooksApp } from "@/di";
import { quickbooksKeys } from "../keys/quickbooksKeys";
import { quickbooksQueryDefaults } from "./cacheConfig";

export interface UseQuickbooksProjectAttachmentsParams {
  projectNumber: string | null | undefined;
  includeTempDownloadUrl?: boolean;
  realmId?: string;
  enabled?: boolean;
}

export function useQuickbooksProjectAttachments(
  params: UseQuickbooksProjectAttachmentsParams,
) {
  const { projectNumber, includeTempDownloadUrl = true, realmId, enabled = true } = params;
  const ctx = useQuickbooksApp();
  const trimmed = (projectNumber ?? "").trim();

  return useQuery({
    queryKey: quickbooksKeys.projectAttachments(trimmed, includeTempDownloadUrl),
    queryFn: () =>
      ctx.repos.quickbooks.getProjectAttachments({
        projectNumber: trimmed,
        includeTempDownloadUrl,
        realmId,
      }),
    enabled: enabled && trimmed.length > 0,
    ...quickbooksQueryDefaults,
  });
}
