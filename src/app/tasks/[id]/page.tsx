import { Suspense } from "react";
import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { TaskDetailPageView } from "@/features/tasks/presentation/pages/TaskDetailPageView";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("tasks:read")) redirect("/dashboard");
  const { id } = await params;
  const taskId = Number(id.replace(/^T-/i, ""));
  if (!Number.isInteger(taskId) || taskId < 1) redirect("/tasks");
  return <Suspense fallback={null}><TaskDetailPageView taskId={taskId} /></Suspense>;
}
