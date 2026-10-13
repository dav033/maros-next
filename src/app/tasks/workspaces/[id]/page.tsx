import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { TaskWorkspaceDetailPageView } from "@/features/task-workspaces/presentation/pages/TaskWorkspaceDetailPageView";
import { parsePositiveSafeInteger } from "@/shared/utils/parsePositiveSafeInteger";

export const dynamic = "force-dynamic";

export default async function TaskWorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("tasks:read")) redirect("/dashboard");
  const workspaceId = parsePositiveSafeInteger((await params).id);
  if (workspaceId === null) redirect("/tasks/workspaces");
  return <TaskWorkspaceDetailPageView workspaceId={workspaceId} />;
}
