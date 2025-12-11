"use client";

import { TableSkeleton } from "@dav033/dav-components";
import type { TableSkeletonColumn } from "@dav033/dav-components";
import { useLeadsTableColumns } from "../hooks";

export function LeadsTableSkeleton() {
  const columns = useLeadsTableColumns({
    onOpenContactModal: () => {},
    onOpenNotesModal: () => {},
  });

  const skeletonColumns: TableSkeletonColumn[] = columns.map((col) => {
    const isBadge = col.key === "status" || col.key === "projectType";
    const align = col.className?.includes("text-center") ? "center" : undefined;

    let skeletonWidth = "w-3/4";
    if (col.key === "notes") {
      skeletonWidth = "w-12";
    } else if (col.key === "leadNumber") {
      skeletonWidth = "w-20";
    } else if (col.key === "name") {
      skeletonWidth = "w-3/4";
    } else if (col.key === "contact") {
      skeletonWidth = "w-2/3";
    } else if (col.key === "projectType") {
      skeletonWidth = "w-3/5";
    } else if (col.key === "location") {
      skeletonWidth = "w-4/5";
    } else if (col.key === "status") {
      skeletonWidth = "w-24";
    }

    const widthMatch = col.className?.match(/w-\[(\d+)px\]/);
    const width = widthMatch 
      ? `w-[${widthMatch[1]}px]` 
      : col.className?.split(" ").find(c => c.startsWith("w-")) || "w-[100px]";

    return {
      width,
      header: col.header || "",
      align,
      skeletonWidth,
      isBadge,
    };
  });

  return <TableSkeleton columns={skeletonColumns} rowCount={13} />;
}

