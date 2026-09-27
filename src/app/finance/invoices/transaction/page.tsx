import { redirect } from "next/navigation";

import { InvoiceManualTransactionPage } from "@/features/invoice-scans/presentation/pages/InvoiceManualTransactionPage";
import { fetchCurrentUser } from "@/shared/auth/currentUser";

export const dynamic = "force-dynamic";

export default async function InvoiceManualTransactionRoute() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("finance:write")) redirect("/dashboard");

  return <InvoiceManualTransactionPage />;
}
