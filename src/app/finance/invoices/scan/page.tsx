import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { InvoiceScanUploadPage } from "@/features/invoice-scans/presentation/pages/InvoiceScanUploadPage";

export const dynamic = "force-dynamic";

export default async function InvoiceScanUploadRoute() {
  const user = await fetchCurrentUser();
  if (!user?.permissions.includes("finance:write")) redirect("/dashboard");

  return <InvoiceScanUploadPage />;
}
