/**
 * Formats a number as currency with commas for thousands separator
 * @param amount - The amount to format (number or string)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "$1,234.56" or "-" if invalid
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  decimals: number = 2
): string {
  if (amount === null || amount === undefined) {
    return "-";
  }

  // Convert to number if it's a string
  const numAmount = typeof amount === "number" ? amount : parseFloat(String(amount));

  if (isNaN(numAmount)) {
    return "-";
  }

  // Format with commas and decimals
  return `$${numAmount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

