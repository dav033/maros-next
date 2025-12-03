import { QueryClient } from "@tanstack/react-query";

/**
 * Default configuration for React Query client.
 * Centralized to ensure consistent behavior across the application.
 */
const DEFAULT_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  refetchOnWindowFocus: false,
  retry: 1,
} as const;

/**
 * Creates a new QueryClient instance with default configuration.
 * Use this function to ensure consistent query client setup across the app.
 * 
 * @returns A configured QueryClient instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: DEFAULT_QUERY_CONFIG,
    },
  });
}

/**
 * Singleton QueryClient instance for use in non-React contexts.
 * For React components, prefer using QueryClientProvider with a client created via createQueryClient().
 */
export const queryClient = createQueryClient();
