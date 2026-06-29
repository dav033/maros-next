import type { QuickbooksRepositoryPort } from "../domain";

export type QuickbooksAppContext = Readonly<{
  repos: {
    quickbooks: QuickbooksRepositoryPort;
  };
}>;

export function makeQuickbooksAppContext(
  deps: QuickbooksAppContext,
): QuickbooksAppContext {
  return deps;
}
