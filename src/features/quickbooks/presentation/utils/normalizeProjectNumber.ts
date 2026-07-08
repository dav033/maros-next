export function normalizeProjectNumber(value: string): string {
  return value.replace(/^\[/, "").replace(/\]$/, "").trim().toUpperCase();
}
