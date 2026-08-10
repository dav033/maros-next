import { Suspense } from "react";
import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { TasksListPageView } from "@/features/tasks/presentation/pages/TasksListPageView";

export const dynamic = "force-dynamic";

export default async function TasksListPage() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("tasks:read")) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={null}>
      <TasksListPageView />
    </Suspense>
  );
}
