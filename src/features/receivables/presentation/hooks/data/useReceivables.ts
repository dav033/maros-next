"use client";

import { useQuery } from "@tanstack/react-query";
import { optimizedApiClient } from "@/shared/infra";
import type { ReceivablesReport } from "../../../domain/types";

/**
 * Read-only aging report, straight from the endpoint with no client-side recomputation:
 * the buckets are cut against the backend's `asOf` date, and recutting them against the
 * browser's clock would quietly disagree with it around midnight.
 */
export function useReceivables() {
  return useQuery<ReceivablesReport>({
    queryKey: ["projects", "receivables"],
    queryFn: async () => {
      const { data } = await optimizedApiClient.get<ReceivablesReport>("/projects/receivables");
      return data;
    },
    // A 403 for a missing `finance:read` will still be a 403 on the third attempt, and the
    // retry backoff would bury that answer under seven seconds of spinner.
    retry: (attempt, error) => attempt < 2 && !isClientError(error),
  });
}

function isClientError(error: unknown): boolean {
  const status = (error as { status?: number } | null)?.status;
  return typeof status === "number" && status >= 400 && status < 500;
}

/** The screen explains a missing permission in words, so it has to recognise one. */
export function isForbiddenError(error: unknown): boolean {
  const candidate = error as { kind?: string; status?: number } | null;
  return candidate?.kind === "forbidden" || candidate?.status === 403;
}
