import type { UsersAppContext } from "@/features/users/application/context";
import type { PermissionCatalog } from "@/features/users/domain";

export async function getPermissionCatalog(
  ctx: UsersAppContext
): Promise<PermissionCatalog> {
  return ctx.repos.role.permissionCatalog();
}
