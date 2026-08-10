import { api } from "@/shared/infra";

export const endpoints = {
  users: () => api.resource("users"),
  user: (id: number) => `${api.resource("users")}/${id}`,
  /** No permission required — see UsersController.findUserDirectory. */
  directory: () => api.resource("users/directory"),
  roles: () => api.resource("roles"),
  role: (id: number) => `${api.resource("roles")}/${id}`,
  permissions: () => api.resource("permissions"),
} as const;
