import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { AppError } from "@/shared/errors";
import { notifyError } from "@/shared/presentation/toast";

const MINUTE = 60 * 1000;

export const STALE_TIMES = {
  analytics: 30 * MINUTE,
  reports: 30 * MINUTE,
  detail: 5 * MINUTE,
  lists: 2 * MINUTE,
  volatile: 30 * 1000,
} as const;

export type StaleTimeKey = keyof typeof STALE_TIMES;

const DEFAULT_QUERY_CONFIG = {
  staleTime: STALE_TIMES.detail,
  gcTime: 10 * MINUTE,
  refetchOnWindowFocus: false,
  retry: 1,
} as const;

function shouldSilence(error: unknown): boolean {
  const appError = AppError.from(error);
  return appError.kind === "canceled" || appError.kind === "unauthorized";
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: DEFAULT_QUERY_CONFIG,
      mutations: {
        onError: (error) => {
          if (shouldSilence(error)) return;
          notifyError(error);
        },
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (shouldSilence(error)) return;
        if (query.state.data === undefined) return;
        notifyError(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (shouldSilence(error)) return;
        if (mutation.options.onError) return;
        notifyError(error);
      },
    }),
  });
}

export const queryClient = createQueryClient();
