import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { UsersSettingsPageView } from "@/features/users/presentation/pages/UsersSettingsPageView";

export const dynamic = "force-dynamic";

export default async function SettingsUsersPage() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("users:read")) {
    redirect("/dashboard");
  }

  return <UsersSettingsPageView />;
}
