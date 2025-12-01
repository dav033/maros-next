"use client";

import { Skeleton } from "../atoms";

export type TableSkeletonColumn = {
  width: string;
  header: string;
  skeletonWidth?: string;
  align?: "left" | "center" | "right";
  isBadge?: boolean;
};

export type TableSkeletonProps = {
  columns: TableSkeletonColumn[];
  rowCount?: number;
};

export function TableSkeleton({ 
  columns, 
  rowCount = 13 
}: TableSkeletonProps) {
  return (
    <section className="flex-1 rounded-2xl border border-theme-gray bg-gray-800/50 shadow-sm">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          {columns.map((col, index) => (
            <col key={index} className={col.width} />
          ))}
        </colgroup>
        <thead className="bg-gray-700/60">
          <tr className="border-b border-theme-gray-subtle text-left text-xs uppercase tracking-wide text-gray-400">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className={`px-4 py-3 ${
                  col.align === "right" ? "text-right" :
                  col.align === "center" ? "text-center" :
                  "text-left"
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-theme-gray-subtle last:border-b-0"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  {col.align === "right" || col.align === "center" ? (
                    <div className={`flex ${
                      col.align === "right" ? "justify-end" :
                      "justify-center"
                    }`}>
                      <Skeleton 
                        className={`h-${col.isBadge ? "5" : "4"} ${
                          col.skeletonWidth || "w-12"
                        }${col.isBadge ? " rounded-full" : ""}`}
                      />
                    </div>
                  ) : (
                    <Skeleton 
                      className={`h-${col.isBadge ? "5" : "4"} ${
                        col.skeletonWidth || "w-3/4"
                      }${col.isBadge ? " rounded-full" : ""}`}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
