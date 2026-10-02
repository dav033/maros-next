import { formatCurrency } from "@/shared/utils";

/**
 * `—` for null, never `$0.00`: on this screen a missing amount means nobody recorded an
 * invoice yet, and a zero would read as "there is nothing to collect".
 */
export function money(amount: number | null | undefined): string {
  return amount === null || amount === undefined ? "—" : formatCurrency(amount);
}
