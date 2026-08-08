import type { UsersAppContext } from "@/features/users/application/context";
import type { AppUser } from "@/features/users/domain";

export async function listUsers(ctx: UsersAppContext): Promise<AppUser[]> {
  return ctx.repos.user.list();
}
