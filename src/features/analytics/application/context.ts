import type { AnalyticsRepositoryPort } from "../domain";

export type AnalyticsAppContext = Readonly<{
  repos: {
    analytics: AnalyticsRepositoryPort;
  };
}>;

export function makeAnalyticsAppContext(
  deps: AnalyticsAppContext,
): AnalyticsAppContext {
  return deps;
}
