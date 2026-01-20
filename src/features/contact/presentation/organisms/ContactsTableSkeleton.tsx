"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ContactsTableSkeleton() {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="w-[80px] px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Notes
            </th>
            <th className="w-[180px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Name
            </th>
            <th className="w-[180px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Company
            </th>
            <th className="w-[180px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Phone
            </th>
            <th className="w-[200px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Email
            </th>
            <th className="w-[100px] px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Customer
            </th>
            <th className="w-[80px] px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Client
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 13 }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-border/50">
              <td className="px-4 py-3 text-center">
                <Skeleton className="h-4 w-12" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-3/4" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-3/4" />
              </td>
              <td className="px-4 py-3 text-center">
                <Skeleton className="mx-auto h-6 w-16 rounded-full" />
              </td>
              <td className="px-4 py-3 text-center">
                <Skeleton className="mx-auto h-6 w-16 rounded-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
