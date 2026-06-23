import type { QuickbooksAppContext } from "@/quickbooks";
import { QuickbooksHttpRepository, makeQuickbooksAppContext } from "@/quickbooks";

export function createQuickbooksAppContext(): QuickbooksAppContext {
  return makeQuickbooksAppContext({
    repos: {
      quickbooks: new QuickbooksHttpRepository(),
    },
  });
}
