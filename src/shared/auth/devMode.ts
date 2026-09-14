export function isDevAuthBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_AUTH_BYPASS === "true" &&
    Boolean(process.env.DEV_AUTH_SECRET) &&
    process.env.DEV_AUTH_SECRET !== process.env.AUTH_SECRET
  );
}
