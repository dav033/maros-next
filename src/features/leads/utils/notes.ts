// Helper para convertir notesJson a array
export function getNotesArray(notesJson?: string): string[] {
  if (!notesJson) return [];
  try {
    return JSON.parse(notesJson);
  } catch {
    return [];
  }
}
