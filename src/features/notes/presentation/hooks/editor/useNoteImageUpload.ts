"use client";

import { useCallback } from "react";
import { getEntityPresignedUploadUrl } from "@/features/attachments/actions/s3Actions";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Uploads an image straight to S3 via a presigned PUT (bypassing the Nest backend, same
 * as the rest of the attachments feature) and returns the S3 key to store on the image
 * node — never the presigned URL, which expires in 1h. Nest's S3Service enforces a 5MB
 * cap server-side for its own upload path; this path skips that service entirely, so the
 * same limit is re-checked here for parity.
 */
export function useNoteImageUpload(pageId: number) {
  return useCallback(
    async (file: File): Promise<string | null> => {
      if (!file.type.startsWith("image/")) return null;
      if (file.size > MAX_FILE_SIZE_BYTES) {
        window.alert(`${file.name} is larger than 5MB and was not uploaded.`);
        return null;
      }

      const { url, key } = await getEntityPresignedUploadUrl(
        "note",
        pageId,
        file.name,
        file.type
      );
      const res = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
      return key;
    },
    [pageId]
  );
}
