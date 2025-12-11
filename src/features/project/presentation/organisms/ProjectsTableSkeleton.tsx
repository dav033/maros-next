"use client";

import { TableSkeleton } from "@dav033/dav-components";
import type { TableSkeletonColumn } from "@dav033/dav-components";

const columns: TableSkeletonColumn[] = [
  {
    width: "w-[150px]",
    header: "Lead Number",
    skeletonWidth: "w-24",
  },
  {
    width: "w-[200px]",
    header: "Lead Name",
    skeletonWidth: "w-3/4",
  },
  {
    width: "w-[150px]",
    header: "Progress Status",
    skeletonWidth: "w-24",
    isBadge: true,
  },
  {
    width: "w-[150px]",
    header: "Invoice Status",
    skeletonWidth: "w-24",
    isBadge: true,
  },
  {
    width: "w-[150px]",
    header: "Invoice Amount",
    align: "right",
    skeletonWidth: "w-20",
  },
  {
    width: "w-[150px]",
    header: "Last Payment",
    align: "right",
    skeletonWidth: "w-20",
  },
  {
    width: "w-[120px]",
    header: "QuickBooks",
    align: "center",
    skeletonWidth: "w-16",
    isBadge: true,
  },
];

export function ProjectsTableSkeleton() {
  return <TableSkeleton columns={columns} rowCount={13} />;
}



