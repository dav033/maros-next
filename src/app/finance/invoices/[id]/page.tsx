import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { InvoiceScanDetailPage } from "@/features/invoice-scans/presentation/pages/InvoiceScanDetailPage";

export const dynamic = "force-dynamic";

export default async function InvoiceScanDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("finance:write")) redirect("/dashboard");
  const { id } = await params;

  return <InvoiceScanDetailPage id={id} />;
}
