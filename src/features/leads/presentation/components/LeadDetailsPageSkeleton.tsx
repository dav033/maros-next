export function LeadDetailsPageSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-sm bg-elev-3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-lg bg-elev-3" />
          <div className="h-32 animate-pulse rounded-lg bg-elev-3" />
        </div>
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-lg bg-elev-3" />
          <div className="h-48 animate-pulse rounded-lg bg-elev-3" />
        </div>
      </div>
    </div>
  );
}
