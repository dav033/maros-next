"use client";

import { TableSkeleton } from "@dav033/dav-components";
import type { TableSkeletonColumn } from "@dav033/dav-components";

const columns: TableSkeletonColumn[] = [
  {
    width: "w-[80px]",
    header: "Notes",
    align: "center",
    skeletonWidth: "w-12",
  },
  {
    width: "w-[200px]",
    header: "Name",
    skeletonWidth: "w-3/4",
  },
  {
    width: "w-[250px]",
    header: "Address",
    skeletonWidth: "w-4/5",
  },
  {
    width: "w-[120px]",
    header: "Type",
    skeletonWidth: "w-20",
    isBadge: true,
  },
  {
    width: "w-[150px]",
    header: "Service",
    skeletonWidth: "w-24",
    isBadge: true,
  },
  {
    width: "w-[100px]",
    header: "Status",
    align: "center",
    skeletonWidth: "w-16",
    isBadge: true,
  },
  {
    width: "w-[100px]",
    header: "Customer",
    align: "center",
    skeletonWidth: "w-16",
    isBadge: true,
  },
  {
    width: "w-[100px]",
    header: "Client",
    align: "center",
    skeletonWidth: "w-16",
    isBadge: true,
  },
];

export function CompaniesTableSkeleton() {
  return <TableSkeleton columns={columns} rowCount={13} />;
}
