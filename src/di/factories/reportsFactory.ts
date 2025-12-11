import type { ReportsAppContext } from "@/reports";
import { makeReportsAppContext, ReportsHttpRepository } from "@/reports";

export function createReportsAppContext(): ReportsAppContext {
  return makeReportsAppContext({
    repos: {
      reports: new ReportsHttpRepository(),
    },
  });
}







