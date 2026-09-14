import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { InvoiceScansPage } from "@/features/invoice-scans/presentation/pages/InvoiceScansPage";

export const dynamic = "force-dynamic";

export default async function InvoiceScansRoute() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("finance:write")) redirect("/dashboard");

  return <InvoiceScansPage />;
}
