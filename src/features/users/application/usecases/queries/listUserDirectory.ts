import type { UsersAppContext } from "@/features/users/application/context";
import type { DirectoryUser } from "@/features/users/domain";

/**
 * Colleagues available in people pickers across the app. Deliberately a plain
 * directory — name, email and picture — because listing users with their roles needs
 * `users:read`, which members do not have, and picking a colleague (to share a note,
 * to assign a task) must not require being an admin.
 */
export async function listUserDirectory(ctx: UsersAppContext): Promise<DirectoryUser[]> {
  return ctx.repos.user.listDirectory();
}
