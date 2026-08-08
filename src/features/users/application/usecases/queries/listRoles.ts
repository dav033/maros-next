import type { UsersAppContext } from "@/features/users/application/context";
import type { AppRole } from "@/features/users/domain";

export async function listRoles(ctx: UsersAppContext): Promise<AppRole[]> {
  return ctx.repos.role.list();
}
