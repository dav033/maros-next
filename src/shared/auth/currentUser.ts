import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http/serverRepositories";
import type { Permission } from "./permissions";

export interface CurrentUser {
  id: number;
  email: string;
  name: string | null;
  picture: string | null;
  role: { id: number; name: string } | null;
  permissions: Permission[];
}

/**
 * Server-side only. Reads the request's forwarded session cookie via
 * createServerApiClient and resolves GET /users/me.
 *
 * Returns null rather than throwing: middleware.ts already guarantees a
 * valid session cookie for any page that renders this (everything except
 * /login), so a failure here means the account was deactivated after the
 * cookie was issued, or the backend is unreachable — not something the
 * layout should crash over. Pages that need a definite user should still
 * treat null defensively.
 */
export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    const client = createServerApiClient(await headers());
    const { data } = await client.get<CurrentUser>("/users/me");
    return data;
  } catch {
    return null;
  }
}
