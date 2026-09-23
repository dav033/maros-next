"use client";

import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** Non-fatal scan problems. Amber, not red: the invoice is usable, but check these. */
export function InvoiceScanWarnings({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <Alert className="border-amber-500/50 bg-amber-500/5 text-amber-900 dark:text-amber-200 [&>svg]:text-amber-600">
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>
        {warnings.length === 1 ? "Check this before entering" : `Check these ${warnings.length} things before entering`}
      </AlertTitle>
      <AlertDescription>
        <ul className="list-disc space-y-1 pl-4">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
