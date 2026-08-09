import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { listAllNoteLinksAction } from "@/notes/actions/noteSharingActions";
import { PublicLinksSettingsView } from "@/notes/presentation/pages/PublicLinksSettingsView";

export const dynamic = "force-dynamic";

export default async function PublicLinksSettingsPage() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("users:write")) redirect("/dashboard");
  const result = await listAllNoteLinksAction();
  return <PublicLinksSettingsView initialLinks={result.success ? result.data : []} />;
}
