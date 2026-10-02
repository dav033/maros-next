"use client";

import { Users } from "lucide-react";
import { ClientScorecardTable } from "./ClientScorecardTable";
import { ReportEmpty, ReportError, ReportTableSkeleton } from "./ReportStates";
import { useClientScorecard } from "./useClientScorecard";

export function ClientScorecardReport() {
  const query = useClientScorecard(50);
  const rows = query.data ?? [];
  const repeatRows = rows.filter((row) => row.leadCount > 1);
  const repeatLeads = repeatRows.reduce((total, row) => total + row.leadCount, 0);

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 font-display text-xl font-semibold">
          <Users className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Client scorecard
        </h1>
        <p className="text-sm text-muted-foreground">
          Who comes back, and who comes back without ever buying.
          {repeatRows.length > 0
            ? ` ${repeatRows.length} clients have more than one lead (${repeatLeads} leads in total).`
            : ""}
        </p>
      </header>

      {query.isPending ? (
        <ReportTableSkeleton columns={6} />
      ) : query.isError ? (
        <ReportError error={query.error} onRetry={() => void query.refetch()} />
      ) : rows.length === 0 ? (
        <ReportEmpty
          title="No clients with leads yet"
          hint="Once leads are attached to contacts, their win record shows up here."
        />
      ) : (
        <ClientScorecardTable rows={rows} />
      )}
    </section>
  );
}
