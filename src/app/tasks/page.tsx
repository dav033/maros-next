import { Suspense } from "react";
import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { TasksPageView } from "@/features/tasks/presentation/pages/TasksPageView";

export const dynamic = "force-dynamic";

export default async function TasksBoardPage() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("tasks:read")) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={null}>
      <TasksPageView />
    </Suspense>
  );
}
