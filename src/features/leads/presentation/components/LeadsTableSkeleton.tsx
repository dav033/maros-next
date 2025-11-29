"use client";

import { Skeleton } from "@/shared/ui";

const SKELETON_ROWS = 13;

export function LeadsTableSkeleton() {
  return (
    <section className="flex-1 rounded-2xl border border-theme-gray bg-gray-800/50 shadow-sm">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col className="w-[150px]" />
          <col className="w-[200px]" />
          <col className="w-[180px]" />
          <col className="w-[150px]" />
          <col className="w-[200px]" />
          <col className="w-[120px]" />
          <col className="w-[130px]" />
        </colgroup>
        <thead className="bg-gray-700/60">
          <tr className="border-b border-theme-gray-subtle text-left text-xs uppercase tracking-wide text-gray-400">
            <th className="px-4 py-3">Lead Number</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Project Type</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Start Date</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
            <tr
              key={index}
              className="border-b border-theme-gray-subtle last:border-b-0"
            >
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-3/4" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-2/3" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-3/5" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-4/5" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-24 rounded-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
