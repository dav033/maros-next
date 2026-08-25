import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { TaskWorkspacesPageView } from "@/features/task-workspaces/presentation/pages/TaskWorkspacesPageView";

export const dynamic = "force-dynamic";

export default async function TaskWorkspacesPage() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("tasks:read")) redirect("/dashboard");
  return <TaskWorkspacesPageView />;
}
