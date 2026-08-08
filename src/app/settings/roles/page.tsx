import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { RolesSettingsPageView } from "@/features/users/presentation/pages/RolesSettingsPageView";

export const dynamic = "force-dynamic";

export default async function SettingsRolesPage() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("users:read")) {
    redirect("/dashboard");
  }

  return <RolesSettingsPageView />;
}
