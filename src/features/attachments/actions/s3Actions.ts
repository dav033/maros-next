"use server";

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type AttachmentEntityKind = "lead" | "project" | "company" | "contact";

const PREFIX_BY_KIND: Record<AttachmentEntityKind, string> = {
  lead: "leads",
  project: "projects",
  company: "companies",
  contact: "contacts",
};

function normalizeBasePrefix(prefix: string | undefined): string {
  const normalized = (prefix || "mcp/attachments/")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");

  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

function getS3Client() {
  return new S3Client({
    region: process.env.S3_REGION!,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
}

export async function getEntityPresignedUploadUrl(
  kind: AttachmentEntityKind,
  entityId: number,
  fileName: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  const prefix = PREFIX_BY_KIND[kind];
  const key = `${normalizeBasePrefix(
    process.env.S3_BASE_PREFIX,
  )}${prefix}/${entityId}/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(getS3Client(), command, { expiresIn: 300 });
  return { url, key };
}

export async function getEntityPresignedDownloadUrl(
  key: string,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
}

export async function getEntityPresignedPreviewUrl(
  key: string,
): Promise<string> {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const contentTypeMap: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    avif: "image/avif",
    bmp: "image/bmp",
    ico: "image/x-icon",
    tif: "image/tiff",
    tiff: "image/tiff",
    heic: "image/heic",
    heif: "image/heif",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ResponseContentDisposition: "inline",
    ResponseContentType: contentTypeMap[ext],
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
}
