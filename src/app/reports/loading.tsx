import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}
