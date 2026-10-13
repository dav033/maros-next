import { Suspense } from "react";
import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { TaskDetailPageView } from "@/features/tasks/presentation/pages/TaskDetailPageView";
import { parsePositiveSafeInteger } from "@/shared/utils/parsePositiveSafeInteger";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("tasks:read")) redirect("/dashboard");
  const { id } = await params;
  const taskId = parsePositiveSafeInteger(id.replace(/^T-/i, ""));
  if (taskId === null) redirect("/tasks");
  return <Suspense fallback={null}><TaskDetailPageView taskId={taskId} /></Suspense>;
}
