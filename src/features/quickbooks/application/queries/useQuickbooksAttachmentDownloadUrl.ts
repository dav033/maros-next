"use client";

import { useQuery } from "@tanstack/react-query";
import { useQuickbooksApp } from "@/di";
import { quickbooksKeys } from "../keys/quickbooksKeys";
import { quickbooksQueryDefaults } from "./cacheConfig";

export function useQuickbooksAttachmentDownloadUrl(
  attachmentId: string | null | undefined,
  options?: { realmId?: string; enabled?: boolean },
) {
  const ctx = useQuickbooksApp();
  const trimmed = (attachmentId ?? "").trim();
  const enabled = (options?.enabled ?? true) && trimmed.length > 0;

  return useQuery({
    queryKey: quickbooksKeys.attachmentDownloadUrl(trimmed),
    queryFn: () =>
      ctx.repos.quickbooks.getAttachmentDownloadUrl({
        attachmentId: trimmed,
        realmId: options?.realmId,
      }),
    enabled,
    ...quickbooksQueryDefaults,
  });
}
