import { ReceivablesPage } from "@/features/receivables/presentation/pages/ReceivablesPage";

/**
 * No server-side permission redirect here, unlike the other /finance routes: the report's
 * own 403 is the message worth showing, and bouncing someone to the dashboard would leave
 * them guessing why the link they were sent does nothing.
 */
export default function ReceivablesRoute() {
  return <ReceivablesPage />;
}
