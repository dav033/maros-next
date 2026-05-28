import type { ReactNode } from "react";
import { WidgetError, WidgetErrorWithRetry, WidgetSkeleton } from "./WidgetStates";

type QueryLike<T> = {
  isLoading: boolean;
  isFetching?: boolean;
  error: unknown;
  data: T | undefined;
  refetch: () => Promise<unknown>;
};

type AsyncWidgetProps<T> = {
  query: QueryLike<T>;
  errorText: string;
  emptyText?: string;
  skeleton?: ReactNode;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
};

function defaultIsEmpty<T>(data: T): boolean {
  if (Array.isArray(data)) return data.length === 0;
  return data === null || data === undefined;
}

export function AsyncWidget<T>({
  query,
  errorText,
  emptyText,
  skeleton,
  isEmpty = defaultIsEmpty,
  children,
}: AsyncWidgetProps<T>) {
  if (query.isLoading) {
    return <>{skeleton ?? <WidgetSkeleton />}</>;
  }

  if (query.error) {
    return <WidgetErrorWithRetry text={errorText} onRetry={() => void query.refetch()} />;
  }

  if (query.data === undefined) {
    return <WidgetErrorWithRetry text={errorText} onRetry={() => void query.refetch()} />;
  }

  if (emptyText && isEmpty(query.data)) {
    return <WidgetError text={emptyText} />;
  }

  const isRefetching = Boolean(query.isFetching) && !query.isLoading;

  return (
    <div className={`relative dashboard-widget-enter ${isRefetching ? "is-refetching" : ""}`}>
      {isRefetching ? (
        <span
          className="refetch-indicator pointer-events-none absolute right-3 top-3 z-10 flex h-2 w-2"
          aria-label="Refreshing data"
          title="Refreshing data"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
      ) : null}
      {children(query.data)}
    </div>
  );
}
