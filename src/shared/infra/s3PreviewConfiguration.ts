const REQUIRED_S3_PREVIEW_ENV = [
  "S3_REGION",
  "S3_BUCKET_NAME",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
] as const;

export function hasS3PreviewConfiguration(): boolean {
  return REQUIRED_S3_PREVIEW_ENV.every((name) => Boolean(process.env[name]?.trim()));
}
