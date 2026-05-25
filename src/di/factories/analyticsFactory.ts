import type { AnalyticsAppContext } from "@/analytics";
import { AnalyticsHttpRepository, makeAnalyticsAppContext } from "@/analytics";

export function createAnalyticsAppContext(): AnalyticsAppContext {
  return makeAnalyticsAppContext({
    repos: {
      analytics: new AnalyticsHttpRepository(),
    },
  });
}
