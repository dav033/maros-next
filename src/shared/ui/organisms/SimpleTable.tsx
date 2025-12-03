"use client";

import React from "react";

type SimpleTableSortValue = string | number | null | undefined;

export type SimpleTableColumn<T> = {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => SimpleTableSortValue;
};

export interface SimpleTableProps<T> {
  columns: SimpleTableColumn<T>[];
  data: T[];
  rowKey: (item: T) => React.Key;
  onRowContextMenu?: (
    event: React.MouseEvent<HTMLTableRowElement>,
    item: T
  ) => void;
}

type SortDirection = "asc" | "desc";

type SortState = {
  key: string;
  direction: SortDirection;
};

export function SimpleTable<T>({
  columns,
  data,
  rowKey,
  onRowContextMenu,
}: SimpleTableProps<T>) {
  const [sortState, setSortState] = React.useState<SortState | null>(null);

  const sortedData = React.useMemo(() => {
    if (!sortState) {
      return data;
    }

    const column = columns.find((col) => String(col.key) === sortState.key);
    if (!column || !column.sortable) {
      return data;
    }

    const getSortValue = (item: T) => {
      const value = column.sortValue
        ? column.sortValue(item)
        : (item as any)[column.key as string];
      if (value == null) {
        return "";
      }
      return value;
    };

    const normalize = (value: unknown) =>
      typeof value === "number" ? value : String(value).toLowerCase();

    const comparator = (a: T, b: T) => {
      const aValue = normalize(getSortValue(a));
      const bValue = normalize(getSortValue(b));

      if (aValue < bValue) {
        return -1;
      }
      if (aValue > bValue) {
        return 1;
      }
      return 0;
    };

    const sorted = [...data].sort((a, b) => comparator(a, b));

    return sortState.direction === "asc" ? sorted : sorted.reverse();
  }, [columns, data, sortState]);

  const handleSort = (column: SimpleTableColumn<T>) => {
    if (!column.sortable) {
      return;
    }

    const key = String(column.key);
    setSortState((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      return {
        key,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  return (
    <section className="rounded-2xl border border-theme-gray bg-gray-800/50 shadow-sm overflow-x-auto">
      <table className="w-full table-fixed text-sm">
        <thead className="bg-gray-700/60">
          <tr className="border-b border-theme-gray-subtle text-left text-xs uppercase tracking-wide text-gray-400">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-4 py-3 ${column.className ?? ""} ${column.sortable ? "cursor-pointer select-none hover:bg-gray-700/80 transition-colors group" : ""}`}
                onClick={column.sortable ? () => handleSort(column) : undefined}
                aria-sort={
                  sortState?.key === String(column.key)
                    ? sortState.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <div className="flex items-center gap-1.5">
                  <span>{column.header}</span>
                  {column.sortable && sortState?.key === String(column.key) && (
                    <span className="text-xs text-gray-300">
                      {sortState.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr
              key={rowKey(item)}
              onContextMenu={
                onRowContextMenu
                  ? (event) => onRowContextMenu(event, item)
                  : undefined
              }
              className="cursor-default border-b border-theme-gray-subtle last:border-b-0 hover:bg-theme-dark/60"
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`px-4 py-3 ${column.className ?? ""}`}
                >
                  {column.render
                    ? column.render(item)
                    : (item as any)[column.key as string]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
