"use client";

import { TableSkeleton } from "@/shared/ui";
import type { TableSkeletonColumn } from "@/shared/ui";

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
    isBadge: true,
  },
  {
    width: "w-[150px]",
    header: "Occupation",
    skeletonWidth: "w-2/3",
  },
  {
    width: "w-[140px]",
    header: "Phone",
    skeletonWidth: "w-24",
  },
  {
    width: "w-[200px]",
    header: "Email",
    skeletonWidth: "w-3/4",
  },
  {
    width: "w-[180px]",
    header: "Address",
    skeletonWidth: "w-2/3",
  },
  {
    width: "w-[100px]",
    header: "Status",
    align: "center",
    skeletonWidth: "w-16",
    isBadge: true,
  },
  {
    width: "w-[80px]",
    header: "",
    align: "center",
    skeletonWidth: "w-5",
  },
];

export function ContactsTableSkeleton() {
  return <TableSkeleton columns={columns} rowCount={13} />;
}
