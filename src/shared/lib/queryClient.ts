import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { AppError, emitUnauthorized } from "@/shared/errors";
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

/**
 * True when the error must not raise a toast. An expired session qualifies — but it
 * also has to *do* something, so it is announced here before being silenced.
 *
 * Direct browser calls announce it themselves (OptimizedApiClient's interceptor),
 * but a 401 that came back through a server action cannot: server code has no
 * `window` to dispatch on, so it only travels as `kind: "unauthorized"` on the
 * ActionResult. Without this, those simply vanished — the user kept clicking against
 * a dead session and getting "Tu sesión expiró" with nothing ever clearing it.
 * GlobalAuthHandler listens for the event and routes through /api/auth/logout, which
 * drops the HTTP-only cookie and lands on /login.
 */
function shouldSilence(error: unknown): boolean {
  const appError = AppError.from(error);
  if (appError.kind === "unauthorized") {
    emitUnauthorized(appError);
    return true;
  }
  return appError.kind === "canceled";
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
