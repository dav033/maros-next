import {
  ServerApiClient,
  createServerApiClient,
  serverApiClient,
} from "./serverApiClient";

/**
 * Factory function to create a server-side HTTP client instance.
 * This can be used to create repositories that work in Server Components.
 */
export { createServerApiClient };

/**
 * Type alias for the concrete server API client.
 */
export type { ServerApiClient };

/**
 * Default server API client instance for use in Server Components.
 * Uses the same base URL as the client-side optimizedApiClient.
 */
export { serverApiClient };

