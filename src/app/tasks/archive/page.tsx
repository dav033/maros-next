import { Suspense } from "react";
import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { ArchivedTasksPage } from "@/features/tasks/presentation/pages/ArchivedTasksPage";

export const dynamic = "force-dynamic";

export default async function ArchivedTasksRoute() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("tasks:read")) redirect("/dashboard");
  return <Suspense fallback={null}><ArchivedTasksPage /></Suspense>;
}
