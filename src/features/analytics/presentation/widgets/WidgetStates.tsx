import { Inbox, RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WidgetError({ text }: { text: string }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-elev-2 p-6 text-center">
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

/**
 * Every widget on the dashboard is a shadcn <Card> whose header and content are
 * padded `p-6`; this shell was `p-4`, so each placeholder was 16px shorter than
 * the widget replacing it and its contents sat 8px to the left of where they
 * landed. Padding the Card itself reproduces the real box (the header's `pb-2`
 * supplies the gap the content's `pt-0` leaves out).
 */
function CardShellSkeleton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`skeleton-deferred border-line p-6 ${className ?? ""}`}>{children}</Card>
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
      <Skeleton className="mt-2 h-[240px] w-full rounded-md" />
    </CardShellSkeleton>
  );
}

/**
 * KpiOverviewRow renders six cards on a `sm:2 / lg:3 / xl:6` grid. This drew
 * five on `sm:2 / xl:5`, so between lg and xl the rows did not even line up and
 * a sixth card appeared from nowhere when the figures arrived.
 */
export function KpiOverviewSkeleton() {
  return (
    <div className="skeleton-deferred grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-line bg-card p-4 shadow">
          {/* KpiCard: CardContent is `flex flex-col gap-3 p-4` — label row, a
              2xl figure, then the hint/arrow row. */}
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          <Skeleton className="mt-3 h-8 w-28" />
          <Skeleton className="mt-3 h-3.5 w-20" />
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
      <div className="mt-2 flex h-[260px] flex-col">
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
      <div className="mt-2 h-[260px]">
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
      <div className="mt-2 grid h-[260px] grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto]">
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
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg border border-line bg-elev-3 px-4 py-3"
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
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-line bg-elev-3 px-4 py-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-6 w-24" />
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, column) => (
          <div key={column} className="space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
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

/**
 * The real TopClientsTable is a <Table> inside CardContent: five columns
 * (#, Client, Project, Invoiced, Invoices), the last two right-aligned, on
 * 48px rows. This used to draw a flex list of loose bars, which is why the
 * widget visibly re-flowed into a table once the rows arrived.
 */
export function TopClientsSkeleton() {
  return (
    <CardShellSkeleton>
      <CardHeaderSkeleton
        titleWidth="w-28"
        rightSlot={<Skeleton className="h-9 w-[170px] rounded-lg" />}
      />
      <WidgetTableSkeleton
        columns={[
          { width: "w-6", align: "left" },
          { width: "w-32", align: "left" },
          { width: "w-20", align: "left" },
          { width: "w-24", align: "right" },
          { width: "w-8", align: "right" },
        ]}
        rows={5}
      />
    </CardShellSkeleton>
  );
}

/**
 * OutstandingBalancesPanel — four columns (Client, Project, Outstanding, Oldest
 * invoice), the last two right-aligned. The home page used to fall back to
 * TopClientsSkeleton here, which promises five columns and a segmented control
 * this panel does not have.
 */
export function OutstandingBalancesSkeleton() {
  return (
    <CardShellSkeleton>
      <CardHeaderSkeleton
        titleWidth="w-44"
        rightSlot={<Skeleton className="h-[26px] w-28 rounded-md" />}
      />
      <WidgetTableSkeleton
        columns={[
          { width: "w-32", align: "left" },
          { width: "w-20", align: "left" },
          { width: "w-24", align: "right" },
          { width: "w-20", align: "right" },
        ]}
        rows={5}
      />
    </CardShellSkeleton>
  );
}

/** The <Table> the widget panels put inside CardContent: h-10 head, h-12 rows. */
function WidgetTableSkeleton({
  columns,
  rows,
}: {
  columns: { width: string; align: "left" | "right" }[];
  rows: number;
}) {
  return (
    <div className="mt-2">
      <div className="flex h-10 items-center gap-4 border-b border-line">
        {columns.map((column, index) => (
          <Skeleton
            key={index}
            className={`h-3 ${column.width} ${column.align === "right" ? "ml-auto" : ""}`}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex h-12 items-center gap-4 border-b border-line">
          {columns.map((column, index) => (
            <Skeleton
              key={index}
              className={`h-4 ${column.width} ${column.align === "right" ? "ml-auto" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * ProjectHealthList: WidgetCardHeader (icon, title, subtitle and a "Projects"
 * link the skeleton left out, so the header was a row shorter) over
 * `CardContent className="space-y-3"` of `border-line-strong border-l-4` rows.
 */
export function ProjectHealthSkeleton() {
  return (
    <CardShellSkeleton>
      <CardHeaderSkeleton
        titleWidth="w-40"
        rightSlot={<Skeleton className="h-[26px] w-24 rounded-md" />}
      />
      <div className="mt-2 space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-line-strong border-l-4 border-l-muted bg-elev-3 p-3"
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
