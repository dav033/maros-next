"use client";

import { useState } from "react";
import { Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHasPermission } from "@/shared/auth/useHasPermission";
import { LeadLostReasonDialog } from "@/features/leads/presentation/molecules/LeadLostReasonDialog";
import { useLeadStatusChange } from "@/features/leads/presentation/hooks/mutations/useLeadStatusChange";
import { ReportEmpty, ReportError } from "./ReportStates";
import { StaleLeadsSummary } from "./StaleLeadsSummary";
import { StaleLeadsTable, type StaleLeadDecision } from "./StaleLeadsTable";
import { useCloseStaleLead, useStaleLeads } from "./useStaleLeads";

const DAY_OPTIONS = [30, 60, 90] as const;

export function StaleLeadsReport() {
  // Local state, not a URL param: each threshold is its own query key, so switching
  // is a cache hit after the first look and never remounts the page.
  const [days, setDays] = useState<number>(60);
  const query = useStaleLeads(days);
  const report = query.data;

  // El reporte se ve con dashboard:read, pero mover un lead exige leads:write: sin
  // permiso no se ofrece el control en vez de dejar que el servidor conteste 403.
  const canWriteLeads = useHasPermission("leads:write");
  const { close, pendingLeadId } = useCloseStaleLead();
  const { requestStatusChange, lostReasonDialogProps } = useLeadStatusChange();

  const decide: StaleLeadDecision = (lead, status, lostReason) => {
    if (lostReason) {
      void close({ id: lead.id, status, lostReason });
      return;
    }
    void requestStatusChange({
      status,
      // El motivo dominante aquí es "no contestó", así que llega preseleccionado.
      initialReason: "no_response",
      commit: (reason) => close({ id: lead.id, status, lostReason: reason }),
    });
  };

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Hourglass className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            Stale leads
          </h1>
          <p className="text-sm text-muted-foreground">
            Open leads nobody has closed or killed.
            {report ? ` As of ${report.asOf}.` : ""}
          </p>
        </div>
        <div
          role="group"
          aria-label="Minimum age in days"
          className="flex items-center gap-1 rounded-lg border border-line bg-elev-3 p-1"
        >
          {DAY_OPTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={days === option ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              aria-pressed={days === option}
              onClick={() => setDays(option)}
            >
              {option} days
            </Button>
          ))}
        </div>
      </header>

      {query.isPending ? (
        <StaleLeadsSkeleton />
      ) : query.isError ? (
        <ReportError error={query.error} onRetry={() => void query.refetch()} />
      ) : report ? (
        <div className="space-y-4">
          <Card className="border-line">
            <CardContent className="pt-6">
              <StaleLeadsSummary summary={report.summary} days={report.days} />
            </CardContent>
          </Card>
          <Card className="border-line">
            <CardContent className="pt-6">
              {report.leads.length === 0 ? (
                <ReportEmpty
                  title={`No lead older than ${report.days} days`}
                  hint="Any undecided lead without a start date is still listed above."
                />
              ) : (
                <StaleLeadsTable
                  leads={report.leads}
                  onDecide={canWriteLeads ? decide : undefined}
                  pendingLeadId={pendingLeadId}
                />
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <LeadLostReasonDialog {...lostReasonDialogProps} />
    </section>
  );
}

function StaleLeadsSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <Card className="border-line">
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[74px] rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-14 rounded-lg" />
        </CardContent>
      </Card>
      <Card className="border-line">
        <CardContent className="pt-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex h-12 items-center gap-4 border-b border-line">
              {Array.from({ length: 5 }).map((__, cell) => (
                <Skeleton key={cell} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
