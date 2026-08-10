import { Suspense } from "react";
import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { MyTasksPageView } from "@/features/tasks/presentation/pages/MyTasksPageView";

export const dynamic = "force-dynamic";

export default async function MyTasksPage() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("tasks:read")) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={null}>
      <MyTasksPageView />
    </Suspense>
  );
}
