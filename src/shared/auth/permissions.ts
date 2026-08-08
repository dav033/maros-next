/**
 * Mirrors maros-nest's src/common/auth/permissions.ts. Frontend and backend
 * deploy separately (no shared package), so this list is duplicated by hand —
 * it only needs to stay in sync enough to give <Can> and the role editor
 * autocomplete and catch typos; the backend is the actual source of truth
 * and enforcement point.
 */
export type Permission =
  | "dashboard:read"
  | "finance:read"
  | "leads:read"
  | "leads:write"
  | "leads:delete"
  | "projects:read"
  | "projects:write"
  | "projects:delete"
  | "contacts:read"
  | "contacts:write"
  | "contacts:delete"
  | "companies:read"
  | "companies:write"
  | "companies:delete"
  | "notes:read"
  | "notes:write"
  | "notes:delete"
  | "reports:read"
  | "users:read"
  | "users:write";
