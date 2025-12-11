import { QueryClient } from "@tanstack/react-query";


const DEFAULT_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: 1,
} as const;


export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: DEFAULT_QUERY_CONFIG,
    },
  });
}


export const queryClient = createQueryClient();
