"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CompaniesTableSkeleton() {
  return (
    <div className="w-full overflow-auto rounded-2xl bg-elev-2">
      <table className="w-full border-collapse">
        <thead className="bg-elev-3">
          <tr className="h-12 border-b border-line">
            <th className="w-[80px] px-4 py-3 text-center font-display text-xs uppercase tracking-wide text-muted-foreground">
              Notes
            </th>
            <th className="w-[200px] px-4 py-3 text-left font-display text-xs uppercase tracking-wide text-muted-foreground">
              Name
            </th>
            <th className="w-[250px] px-4 py-3 text-left font-display text-xs uppercase tracking-wide text-muted-foreground">
              Address
            </th>
            <th className="w-[120px] px-4 py-3 text-left font-display text-xs uppercase tracking-wide text-muted-foreground">
              Type
            </th>
            <th className="w-[150px] px-4 py-3 text-left font-display text-xs uppercase tracking-wide text-muted-foreground">
              Service
            </th>
            <th className="w-[100px] px-4 py-3 text-center font-display text-xs uppercase tracking-wide text-muted-foreground">
              Status
            </th>
            <th className="w-[100px] px-4 py-3 text-center font-display text-xs uppercase tracking-wide text-muted-foreground">
              Customer
            </th>
            <th className="w-[100px] px-4 py-3 text-center font-display text-xs uppercase tracking-wide text-muted-foreground">
              Client
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 13 }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-line">
              <td className="px-4 py-3 text-center">
                <Skeleton className="h-4 w-12" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-3/4" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-4/5" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-6 w-20 rounded-full" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-6 w-24 rounded-full" />
              </td>
              <td className="px-4 py-3 text-center">
                <Skeleton className="mx-auto h-6 w-16 rounded-full" />
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
