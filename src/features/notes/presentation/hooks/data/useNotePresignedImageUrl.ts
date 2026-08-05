"use client";

import { useQuery } from "@tanstack/react-query";
import { getEntityPresignedPreviewUrl } from "@/features/attachments/actions/s3Actions";

const PRESIGNED_URL_TTL_MS = 3600_000;
// Refresh a bit before the 1h presigned URL actually expires, so a long-open
// note never shows a broken image while the tab is idle.
const STALE_TIME_MS = PRESIGNED_URL_TTL_MS - 5 * 60_000;

/** src is the value stored on the image node: either a real URL (external image) or an S3 key. */
export function useNotePresignedImageUrl(src: string) {
  const isExternalUrl = /^https?:\/\//.test(src) || src.startsWith("data:");

  const query = useQuery({
    queryKey: ["notes", "image-url", src],
    queryFn: () => getEntityPresignedPreviewUrl(src),
    enabled: !isExternalUrl && !!src,
    staleTime: STALE_TIME_MS,
    gcTime: PRESIGNED_URL_TTL_MS,
  });

  if (isExternalUrl) {
    return { url: src, isLoading: false };
  }
  return { url: query.data, isLoading: query.isPending };
}
