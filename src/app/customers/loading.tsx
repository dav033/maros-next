"use client";

import { PageHeaderCard } from "@/components/shared/PageHeaderCard";
import { Skeleton } from "@/components/ui/skeleton";
import { HeartHandshake } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex w-full flex-1 flex-col gap-3 sm:gap-4">
      <PageHeaderCard
        icon={HeartHandshake}
        title="Customers"
        description="View and manage all customers (contacts and companies)"
      />

      <section className="mt-2 flex flex-col gap-6">
        <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
          <Skeleton className="h-5 w-48" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
          <Skeleton className="h-5 w-48" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}
