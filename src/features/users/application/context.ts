import type { RolesRepositoryPort, UsersRepositoryPort } from "@/features/users/domain";

export type UsersAppContext = Readonly<{
  repos: {
    user: UsersRepositoryPort;
    role: RolesRepositoryPort;
  };
}>;

export function makeUsersAppContext(deps: UsersAppContext): UsersAppContext {
  return deps;
}
