import type { UsersAppContext } from "@/features/users";
import { makeUsersAppContext, UsersHttpRepository, RolesHttpRepository } from "@/features/users";

export function createUsersAppContext(): UsersAppContext {
  return makeUsersAppContext({
    repos: {
      user: new UsersHttpRepository(),
      role: new RolesHttpRepository(),
    },
  });
}
