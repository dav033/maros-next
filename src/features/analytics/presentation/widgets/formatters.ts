export const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const tooltipMoneyFormatter = (value: number | string) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? money.format(numeric) : String(value);
};
