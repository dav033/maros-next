"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { NotificationsHttpRepository, makeNotificationsAppContext } from "@/notifications";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";

async function createServerNotificationsAppContext() {
  const api = createServerApiClient(await headers());
  return makeNotificationsAppContext({
    repos: { notification: new NotificationsHttpRepository(api) },
  });
}

export async function markNotificationReadAction(id: number): Promise<ActionResult<null>> {
  try {
    const ctx = await createServerNotificationsAppContext();
    await ctx.repos.notification.markRead(id);
    return success(null);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult<null>> {
  try {
    const ctx = await createServerNotificationsAppContext();
    await ctx.repos.notification.markAllRead();
    return success(null);
  } catch (error) {
    return handleActionError(error);
  }
}
