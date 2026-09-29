import { Suspense } from "react";
import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { TasksPageView } from "@/features/tasks/presentation/pages/TasksPageView";
import { TasksPageSkeleton } from "@/features/tasks/presentation/components/TasksPageSkeleton";

export const dynamic = "force-dynamic";

export default async function TasksBoardPage() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("tasks:read")) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<TasksPageSkeleton />}>
      <TasksPageView />
    </Suspense>
  );
}
