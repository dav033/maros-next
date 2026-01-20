"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProjectsTableSkeleton() {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="w-[150px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Project Number
            </th>
            <th className="w-[200px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Project Name
            </th>
            <th className="w-[150px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Progress Status
            </th>
            <th className="w-[150px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Invoice Status
            </th>
            <th className="w-[150px] px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              Invoice Amount
            </th>
            <th className="w-[150px] px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              Last Payment
            </th>
            <th className="w-[120px] px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              QuickBooks
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 13 }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-border/50">
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-3/4" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-6 w-24 rounded-full" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-6 w-24 rounded-full" />
              </td>
              <td className="px-4 py-3 text-right">
                <Skeleton className="ml-auto h-4 w-20" />
              </td>
              <td className="px-4 py-3 text-right">
                <Skeleton className="ml-auto h-4 w-20" />
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

