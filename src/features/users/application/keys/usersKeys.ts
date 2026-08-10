import { createEntityKeys } from "@/shared/query";

const usersBase = createEntityKeys("users");
const rolesBase = createEntityKeys("roles");

export const usersKeys = {
  ...usersBase,
  directory: () => [...usersBase.all, "directory"] as const,
} as const;

export const rolesKeys = {
  ...rolesBase,
  permissions: () => [...rolesBase.all, "permissions"] as const,
} as const;
