/**
 * Server-side loaders fall back to an empty list when a call fails, so one broken
 * endpoint cannot blank a whole page. Swallowing the error silently, though, makes a
 * failure indistinguishable from "there is nothing here" — both render the same empty
 * state, and the only clue is a list that should not be empty. Routing every fallback
 * through here keeps the degradation and puts the reason in the server log.
 */
export async function orFallback<T>(
  label: string,
  promise: Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error(`[ssr] ${label} failed, rendering its empty state:`, error);
    return fallback;
  }
}
