import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { TaskWorkspaceDetailPageView } from "@/features/task-workspaces/presentation/pages/TaskWorkspaceDetailPageView";

export const dynamic = "force-dynamic";

export default async function TaskWorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("tasks:read")) redirect("/dashboard");
  const workspaceId = Number((await params).id);
  if (!Number.isInteger(workspaceId) || workspaceId < 1) redirect("/tasks/workspaces");
  return <TaskWorkspaceDetailPageView workspaceId={workspaceId} />;
}
