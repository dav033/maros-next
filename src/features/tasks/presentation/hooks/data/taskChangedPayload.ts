export interface TaskChangedPayload {
  taskId: number;
  actorId: number;
}

/** Parses the SSE `task.changed` event's `data` field, tolerating a malformed payload. */
export function parseTaskChangedPayload(raw: string): TaskChangedPayload | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Record<string, unknown>).taskId === "number" &&
      typeof (parsed as Record<string, unknown>).actorId === "number"
    ) {
      return parsed as TaskChangedPayload;
    }
    return null;
  } catch {
    return null;
  }
}
