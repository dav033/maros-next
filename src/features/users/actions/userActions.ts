"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { UsersHttpRepository, RolesHttpRepository, makeUsersAppContext } from "@/features/users";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";
import type { AppRole, AppUser, RoleDraft, RolePatch, UserPatch } from "@/features/users/domain";

async function createServerUsersAppContext() {
  const apiClient = createServerApiClient(await headers());
  return makeUsersAppContext({
    repos: {
      user: new UsersHttpRepository(apiClient),
      role: new RolesHttpRepository(apiClient),
    },
  });
}

export async function updateUserAction(
  id: number,
  patch: UserPatch
): Promise<ActionResult<AppUser>> {
  try {
    const ctx = await createServerUsersAppContext();
    const user = await ctx.repos.user.update(id, patch);
    return success(user);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createRoleAction(draft: RoleDraft): Promise<ActionResult<AppRole>> {
  try {
    const ctx = await createServerUsersAppContext();
    const role = await ctx.repos.role.create(draft);
    return success(role);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateRoleAction(
  id: number,
  patch: RolePatch
): Promise<ActionResult<AppRole>> {
  try {
    const ctx = await createServerUsersAppContext();
    const role = await ctx.repos.role.update(id, patch);
    return success(role);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteRoleAction(id: number): Promise<ActionResult<null>> {
  try {
    const ctx = await createServerUsersAppContext();
    await ctx.repos.role.delete(id);
    return success(null);
  } catch (error) {
    return handleActionError(error);
  }
}
