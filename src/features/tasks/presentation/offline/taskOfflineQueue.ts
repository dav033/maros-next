export type OfflineTaskChange =
  | { id: string; operation: "move"; taskId: number; status: "in_progress" | "done" }
  | { id: string; operation: "postpone"; taskId: number; dueDate: string }
  | { id: string; operation: "photo"; taskId: number; fileName: string; contentType: string; blob: Blob; uploadedKey?: string };

export type OfflineTaskChangeInput =
  | { operation: "move"; taskId: number; status: "in_progress" | "done" }
  | { operation: "postpone"; taskId: number; dueDate: string }
  | { operation: "photo"; taskId: number; fileName: string; contentType: string; blob: Blob; uploadedKey?: string };

const DB_NAME = "maros-tasks-offline";
const STORE_NAME = "changes";

export function isOfflineQueueSupported(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open offline task queue"));
  });
}

export async function enqueueOfflineTaskChange(change: OfflineTaskChangeInput): Promise<boolean> {
  if (!isOfflineQueueSupported()) return false;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put({ ...change, id: crypto.randomUUID() });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not queue task change"));
  });
  db.close();
  return true;
}

export async function listOfflineTaskChanges(): Promise<OfflineTaskChange[]> {
  if (!isOfflineQueueSupported()) return [];
  const db = await openDb();
  return await new Promise<OfflineTaskChange[]>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => { db.close(); resolve(request.result as OfflineTaskChange[]); };
    request.onerror = () => { db.close(); reject(request.error ?? new Error("Could not read offline task queue")); };
  });
}

export async function removeOfflineTaskChange(id: string): Promise<void> {
  if (!isOfflineQueueSupported()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => { db.close(); resolve(); };
    request.onerror = () => { db.close(); reject(request.error ?? new Error("Could not clear offline task change")); };
  });
}

export async function countOfflineTaskChanges(): Promise<number> {
  if (!isOfflineQueueSupported()) return 0;
  const db = await openDb();
  return await new Promise<number>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).count();
    request.onsuccess = () => { db.close(); resolve(request.result); };
    request.onerror = () => { db.close(); reject(request.error ?? new Error("Could not count offline task changes")); };
  });
}
