"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useLeadsTableColumns } from "../hooks";

export function LeadsTableSkeleton() {
  const columns = useLeadsTableColumns({
    onOpenContactModal: () => {},
    onOpenNotesModal: () => {},
  });

  const getSkeletonWidth = (col: any) => {
    if (col.key === "notes") return "w-12";
    if (col.key === "leadNumber") return "w-20";
    if (col.key === "name") return "w-3/4";
    if (col.key === "contact") return "w-2/3";
    if (col.key === "projectType") return "w-3/5";
    if (col.key === "location") return "w-4/5";
    if (col.key === "status") return "w-24";
    return "w-3/4";
  };

  const getWidth = (col: any) => {
    const widthMatch = col.className?.match(/w-\[(\d+)px\]/);
    return widthMatch 
      ? `w-[${widthMatch[1]}px]` 
      : col.className?.split(" ").find((c: string) => c.startsWith("w-")) || "w-[100px]";
  };

  return (
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`
                  ${getWidth(col)} px-4 py-3 text-sm font-medium text-muted-foreground
                  ${col.className?.includes("text-center") ? "text-center" : "text-left"}
                  ${col.className?.includes("text-right") ? "text-right" : ""}
                `}
              >
                {col.header || ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 13 }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-border/50">
              {columns.map((col, colIdx) => {
                const isBadge = col.key === "status" || col.key === "projectType";
                const skeletonWidth = getSkeletonWidth(col);
                const align = col.className?.includes("text-center") ? "center" : col.className?.includes("text-right") ? "right" : "left";

                return (
                  <td
                    key={colIdx}
                    className={`
                      ${getWidth(col)} px-4 py-3
                      ${align === "center" ? "text-center" : align === "right" ? "text-right" : ""}
                    `}
                  >
                    {isBadge ? (
                      <Skeleton className={`h-6 rounded-full ${skeletonWidth}`} />
                    ) : (
                      <Skeleton className={`h-4 ${skeletonWidth}`} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

