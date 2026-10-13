const POSITIVE_DECIMAL_INTEGER = /^[0-9]+$/;

export function parsePositiveSafeInteger(value: string): number | null {
  if (!POSITIVE_DECIMAL_INTEGER.test(value)) return null;

  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}
