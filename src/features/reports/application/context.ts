import type { ReportsRepositoryPort } from "../domain/ports";

export type ReportsAppContext = Readonly<{
  repos: {
    reports: ReportsRepositoryPort;
  };
}>;

export function makeReportsAppContext(deps: ReportsAppContext): ReportsAppContext {
  return deps;
}







