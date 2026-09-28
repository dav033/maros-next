import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/shared/auth/currentUser";
import { QuickbooksConnectionStatusCard } from "@/features/quickbooks/presentation/components/QuickbooksConnectionStatusCard";

export const dynamic = "force-dynamic";

export default async function QuickbooksSettingsPage() {
  const user = await fetchCurrentUser();
  // Mismo permiso que pide el backend en /quickbooks/connection-status.
  if (!user?.permissions.includes("finance:read")) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="font-display text-2xl font-semibold">QuickBooks</h1>
      <p className="mb-6 text-sm text-fg-dim">
        Estado de la conexión que usa el servidor para leer la contabilidad.
      </p>
      <QuickbooksConnectionStatusCard />
    </div>
  );
}
