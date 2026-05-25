export type DateFilter = {
  from: string;
  to: string;
};

export type QuickRangeKey = "last30" | "last90" | "ytd" | "last12m";

export const quickRanges: Array<{ key: QuickRangeKey; label: string }> = [
  { key: "last30", label: "Last 30d" },
  { key: "last90", label: "Last 90d" },
  { key: "ytd", label: "YTD" },
  { key: "last12m", label: "Last 12m" },
];

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultDateFilter(): DateFilter {
  const now = new Date();
  const to = toDateString(now);
  const fromDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const from = toDateString(fromDate);
  return { from, to };
}

export function getQuickDateRange(range: QuickRangeKey): DateFilter {
  const now = new Date();
  const to = toDateString(now);

  if (range === "ytd") {
    return {
      from: `${now.getFullYear()}-01-01`,
      to,
    };
  }

  if (range === "last12m") {
    return getDefaultDateFilter();
  }

  const days = range === "last90" ? 89 : 29;
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - days);
  return {
    from: toDateString(fromDate),
    to,
  };
}

export function isSameRange(a: DateFilter, b: DateFilter): boolean {
  return a.from === b.from && a.to === b.to;
}

export function isValidDateRange(range: DateFilter): boolean {
  return Boolean(range.from) && Boolean(range.to) && range.from <= range.to;
}

export function readRangeFromSearchParams(searchParams: {
  get: (key: string) => string | null;
}): DateFilter | null {
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  if (!from || !to) return null;

  const range = { from, to };
  return isValidDateRange(range) ? range : null;
}

export function detectQuickRangeLabel(range: DateFilter): string | null {
  const match = quickRanges.find((item) => isSameRange(getQuickDateRange(item.key), range));
  return match?.label ?? null;
}

export function detectQuickRangeKey(range: DateFilter): QuickRangeKey | null {
  const match = quickRanges.find((item) => isSameRange(getQuickDateRange(item.key), range));
  return match?.key ?? null;
}

export function readQuickRangeFromSearchParams(searchParams: {
  get: (key: string) => string | null;
}): QuickRangeKey | null {
  const preset = searchParams.get("preset");
  if (preset === "last30" || preset === "last90" || preset === "ytd" || preset === "last12m") {
    return preset;
  }
  return null;
}
