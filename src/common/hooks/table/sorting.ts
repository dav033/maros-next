import type { SimpleTableColumn } from "@/types/table";

export type SortDir = "asc" | "desc";

/**
 * Natural comparison for sorting — handles mixed string/number values,
 * nulls, and uses locale-aware comparison with numeric mode.
 */
export function naturalCompare(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): number {
  const sa = String(a ?? "");
  const sb = String(b ?? "");
  return sa.localeCompare(sb, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * Sorts an array of rows by a column key, using the column's `sortValue` accessor.
 * Returns a new sorted array (does not mutate the input).
 */
export function sortRows<T>(
  rows: T[],
  columns: SimpleTableColumn<T>[],
  sortKey: string | null,
  sortDir: SortDir,
): T[] {
  if (!sortKey) return rows;
  const col = columns.find((c) => String(c.key) === sortKey);
  if (!col?.sortValue) return rows;
  const dir = sortDir === "asc" ? 1 : -1;
  return [...rows].sort(
    (a, b) => dir * naturalCompare(col.sortValue!(a), col.sortValue!(b)),
  );
}
