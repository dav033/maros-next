import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";

export const dynamic = "force-dynamic";

export default async function MyTasksPage() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("tasks:read")) {
    redirect("/dashboard");
  }

  redirect("/tasks?view=mine");
}
