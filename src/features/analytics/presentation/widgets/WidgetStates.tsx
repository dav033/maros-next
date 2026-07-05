import { Inbox, RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function WidgetError({ text }: { text: string }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-card/30 p-6 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="h-5 w-5" />
      </span>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function WidgetErrorWithRetry({ text, onRetry }: { text: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-destructive/15 text-destructive">
        <TriangleAlert className="h-5 w-5" />
      </span>
      <p className="text-sm text-foreground">{text}</p>
      <Button variant="outline" size="sm" className="gap-2" onClick={onRetry}>
        <RotateCw className="h-3.5 w-3.5" />
        Try again
      </Button>
    </div>
  );
}

function CardShellSkeleton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border/60 bg-card/40 p-5 shadow ${className ?? ""}`}>
      {children}
    </div>
  );
}

function CardHeaderSkeleton({
  titleWidth = "w-40",
  withSubtitle = true,
  rightSlot,
}: {
  titleWidth?: string;
  withSubtitle?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 pb-2">
      <div className="space-y-2">
        <Skeleton className={`h-4 ${titleWidth}`} />
        {withSubtitle ? <Skeleton className="h-3 w-32" /> : null}
      </div>
      {rightSlot ?? <Skeleton className="h-8 w-8 rounded-md" />}
    </div>
  );
}

export function WidgetSkeleton({ className }: { className?: string }) {
  return (
    <CardShellSkeleton className={className}>
      <CardHeaderSkeleton />
      <Skeleton className="mt-5 h-[240px] w-full rounded-md" />
    </CardShellSkeleton>
  );
}

export function KpiOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border/60 bg-card/40 p-5 shadow">
          <div className="flex items-start justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          <Skeleton className="mt-4 h-7 w-28" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

const BAR_HEIGHTS = [60, 85, 45, 92, 70, 55, 78];

export function BarChartSkeleton() {
  return (
    <CardShellSkeleton>
      <CardHeaderSkeleton titleWidth="w-36" />
      <div className="mt-4 flex h-[260px] flex-col">
        <div className="flex flex-1 items-end gap-3 pl-6 pr-2">
          {BAR_HEIGHTS.map((height, index) => (
            <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2">
              <Skeleton
                className="w-full rounded-t-md"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-3 pl-6 pr-2">
          {BAR_HEIGHTS.map((_, index) => (
            <Skeleton key={index} className="h-2.5 flex-1 rounded-sm" />
          ))}
        </div>
      </div>
    </CardShellSkeleton>
  );
}

export function LineChartSkeleton() {
  return (
    <CardShellSkeleton>
      <CardHeaderSkeleton titleWidth="w-32" />
      <div className="mt-4 h-[260px]">
        <div className="relative h-[220px] w-full overflow-hidden rounded-md">
          <Skeleton className="absolute inset-0 opacity-40" />
          <svg
            viewBox="0 0 400 160"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="skeletonAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.35" />
                <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,120 C50,90 90,100 140,70 C190,40 240,80 290,55 C340,30 380,60 400,45 L400,160 L0,160 Z"
              fill="url(#skeletonAreaGradient)"
            />
            <path
              d="M0,120 C50,90 90,100 140,70 C190,40 240,80 290,55 C340,30 380,60 400,45"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity="0.55"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="mt-3 flex gap-3 pl-2 pr-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-2.5 flex-1 rounded-sm" />
          ))}
        </div>
      </div>
    </CardShellSkeleton>
  );
}

export function PieChartSkeleton() {
  return (
    <CardShellSkeleton>
      <CardHeaderSkeleton titleWidth="w-40" />
      <div className="mt-4 grid h-[260px] grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div className="flex items-center justify-center">
          <div className="relative h-[200px] w-[200px]">
            <Skeleton className="absolute inset-0 rounded-full" />
            <div className="absolute inset-[28%] rounded-full bg-card" />
          </div>
        </div>
        <ul className="space-y-2 pr-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex items-center gap-2">
              <Skeleton className="h-2.5 w-2.5 rounded-sm" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="ml-auto h-3 w-8" />
              <Skeleton className="h-3 w-8" />
            </li>
          ))}
        </ul>
      </div>
    </CardShellSkeleton>
  );
}

export function FinancialSnapshotSkeleton() {
  return (
    <CardShellSkeleton className="min-h-[170px]">
      <div className="flex items-center justify-between pb-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-4 py-3"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </CardShellSkeleton>
  );
}

export function CostsBreakdownSkeleton() {
  return (
    <CardShellSkeleton>
      <CardHeaderSkeleton titleWidth="w-36" />
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-6 w-24" />
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, column) => (
          <div key={column} className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            {Array.from({ length: 4 }).map((_, row) => (
              <div key={row} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </CardShellSkeleton>
  );
}

export function TopClientsSkeleton() {
  return (
    <CardShellSkeleton>
      <div className="flex items-start justify-between pb-3">
        <div className="flex items-start gap-2.5">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <Skeleton className="h-9 w-[170px] rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-4 border-b border-border/40 pb-2">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="ml-auto h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 py-2">
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="ml-auto h-4 w-20" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </CardShellSkeleton>
  );
}

export function ProjectHealthSkeleton() {
  return (
    <CardShellSkeleton>
      <div className="flex items-start gap-2.5 pb-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-border/60 border-l-4 border-l-muted bg-muted/20 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="mt-2 space-y-1.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </CardShellSkeleton>
  );
}
