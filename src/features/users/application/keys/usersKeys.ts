import { createEntityKeys } from "@/shared/query";

const usersBase = createEntityKeys("users");
const rolesBase = createEntityKeys("roles");

export const usersKeys = {
  ...usersBase,
} as const;

export const rolesKeys = {
  ...rolesBase,
  permissions: () => [...rolesBase.all, "permissions"] as const,
} as const;
