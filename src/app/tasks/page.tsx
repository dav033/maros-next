import { Suspense } from "react";
import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { TasksBoardPageView } from "@/features/tasks/presentation/pages/TasksBoardPageView";

export const dynamic = "force-dynamic";

export default async function TasksBoardPage() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("tasks:read")) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={null}>
      <TasksBoardPageView />
    </Suspense>
  );
}
