import { ServerApiClient, serverApiClient } from "./serverApiClient";
import type { HttpClientLike } from "./types";

/**
 * Factory function to create a server-side HTTP client instance.
 * This can be used to create repositories that work in Server Components.
 */
export function createServerApiClient(baseURL?: string): HttpClientLike {
  return new ServerApiClient(baseURL);
}

/**
 * Default server API client instance for use in Server Components.
 * Uses the same base URL as the client-side optimizedApiClient.
 */
export { serverApiClient };

