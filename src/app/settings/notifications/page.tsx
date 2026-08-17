import { redirect } from "next/navigation";
import { NotificationPreferencesPage } from "@/features/notifications/presentation/pages/NotificationPreferencesPage";
import { fetchCurrentUser } from "@/shared/auth/currentUser";

export default async function NotificationSettingsRoute() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login");
  return <NotificationPreferencesPage />;
}
