import { Inbox, Lock, RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppError } from "@/shared/errors";

/**
 * A 403 here is not a failure, it is a missing permission: the reports read
 * `dashboard:read`, and "Request failed with status code 403" sends people to
 * the console instead of to whoever grants it.
 */
export function reportErrorMessage(error: unknown): string {
  const appError = error instanceof AppError ? error : null;

  if (appError?.kind === "forbidden") {
    return "You do not have access to this report. Ask an administrator for the dashboard permission.";
  }
  if (appError?.kind === "unauthorized") {
    return "Your session expired. Sign in again to see this report.";
  }
  if (appError?.kind === "network" || appError?.kind === "timeout") {
    return "We could not reach the server. Check your connection and try again.";
  }
  return "We could not load this report.";
}

export function ReportError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const isForbidden = error instanceof AppError && error.kind === "forbidden";
  const Icon = isForbidden ? Lock : TriangleAlert;

  return (
    <div
      role="alert"
      className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong bg-elev-2 p-6 text-center"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="max-w-sm text-sm text-foreground">{reportErrorMessage(error)}</p>
      {/* Retrying a 403 just reproduces the 403; only offer it when waiting could help. */}
      {!isForbidden ? (
        <Button variant="outline" size="sm" className="gap-2" onClick={onRetry}>
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function ReportEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-elev-2 p-6 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint ? <p className="max-w-sm text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ReportTableSkeleton({ columns, rows = 8 }: { columns: number; rows?: number }) {
  return (
    <div aria-busy="true" className="rounded-xl border border-line bg-elev-2 p-4">
      <div className="flex h-10 items-center gap-4 border-b border-line">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex h-12 items-center gap-4 border-b border-line">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
