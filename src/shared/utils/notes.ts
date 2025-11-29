export function getNotesArray(json?: string | null): string[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr)) {
      return arr.filter((n) => typeof n === "string");
    }
    return [];
  } catch {
    return [];
  }
}
