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
    width: "w-[180px]",
    header: "Name",
    skeletonWidth: "w-3/4",
  },
  {
    width: "w-[180px]",
    header: "Company",
    skeletonWidth: "w-32",
  },
  {
    width: "w-[180px]",
    header: "Phone",
    skeletonWidth: "w-24",
  },
  {
    width: "w-[200px]",
    header: "Email",
    skeletonWidth: "w-3/4",
  },
  {
    width: "w-[100px]",
    header: "Customer",
    align: "center",
    skeletonWidth: "w-16",
    isBadge: true,
  },
  {
    width: "w-[80px]",
    header: "Client",
    align: "center",
    skeletonWidth: "w-16",
    isBadge: true,
  },
];

export function ContactsTableSkeleton() {
  return <TableSkeleton columns={columns} rowCount={13} />;
}
