import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadStatus, type LeadLostReason } from "@/leads/domain";
import { money } from "../widgets/formatters";
import type { StaleLead, StaleLeadStatus } from "./useStaleLeads";

export type StaleLeadDecision = (
  lead: StaleLead,
  status: LeadStatus.WON | LeadStatus.LOST,
  /** Omitirlo deja que el control pida el motivo; pasarlo cierra el lead de un clic. */
  lostReason?: LeadLostReason,
) => void;

const STATUS_LABELS: Record<NonNullable<StaleLeadStatus>, string> = {
  NEW_LEAD: "New lead",
  CONTACTED: "Contacted",
  ESTIMATING_PREPARING_PROPOSAL: "Estimating",
  PROPOSAL_SENT: "Proposal sent",
  FOLLOW_UP: "Follow up",
};

/**
 * A missing status and an untouched NEW_LEAD are the two ways a lead rots without
 * anybody declaring it dead, so they are the two the eye should catch first.
 */
function statusStyle(status: StaleLeadStatus): string {
  if (status === null) return "bg-rose-500/15 text-rose-300 border border-rose-500/30";
  if (status === "NEW_LEAD") return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
  return "bg-elev-4 text-muted-foreground border border-line-strong";
}

/**
 * `onDecide` ausente significa sin permiso de escritura: la columna entera
 * desaparece en vez de ofrecer botones que volverían con un 403.
 */
export function StaleLeadsTable({
  leads,
  onDecide,
  pendingLeadId = null,
}: {
  leads: StaleLead[];
  onDecide?: StaleLeadDecision;
  pendingLeadId?: number | null;
}) {
  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-display text-xs uppercase tracking-wide text-muted-foreground">
              Lead
            </TableHead>
            <TableHead className="font-display text-xs uppercase tracking-wide text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="font-display text-right text-xs uppercase tracking-wide text-muted-foreground">
              Estimate
            </TableHead>
            <TableHead className="font-display text-right text-xs uppercase tracking-wide text-muted-foreground">
              Age
            </TableHead>
            <TableHead className="font-display text-right text-xs uppercase tracking-wide text-muted-foreground">
              Bucket
            </TableHead>
            {onDecide ? (
              <TableHead className="font-display text-right text-xs uppercase tracking-wide text-muted-foreground">
                Decide
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-elev-3">
              <TableCell>
                <Link href={`/lead/${lead.id}`} className="font-medium hover:underline">
                  {lead.name ?? `Lead #${lead.id}`}
                </Link>
                {lead.leadNumber ? (
                  <p className="font-mono text-xs text-muted-foreground">{lead.leadNumber}</p>
                ) : null}
              </TableCell>
              <TableCell>
                <Badge
                  className={`font-display text-xs font-semibold uppercase tracking-wide ${statusStyle(
                    lead.status,
                  )}`}
                >
                  {lead.status === null ? "No status" : STATUS_LABELS[lead.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {money.format(lead.estimate)}
              </TableCell>
              <TableCell
                className="text-right font-mono tabular-nums"
                title={`At least ${lead.ageDays} days since its start date`}
              >
                {lead.ageDays}+ d
              </TableCell>
              <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {lead.ageBucket}
              </TableCell>
              {onDecide ? (
                <TableCell className="text-right">
                  <StaleLeadDecideCell
                    lead={lead}
                    onDecide={onDecide}
                    isPending={pendingLeadId === lead.id}
                  />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Why "+": start_date is the only date on a lead, so nothing here says when it
          was last touched. Every age is a floor, never the real idle time. */}
      <p className="text-xs text-muted-foreground">
        Age is counted from the lead&apos;s start date — there is no last-activity record, so
        each figure is a minimum: at least this old.
      </p>
    </div>
  );
}

/**
 * Un lead que cuesta tres clics y una navegación no se cierra nunca, y de ahí
 * salen los 27 sin estado: el motivo dominante ("no contestó") es un clic en la
 * propia fila, y el resto de desenlaces quedan a un paso detrás del menú.
 */
function StaleLeadDecideCell({
  lead,
  onDecide,
  isPending,
}: {
  lead: StaleLead;
  onDecide: StaleLeadDecision;
  isPending: boolean;
}) {
  const leadLabel = lead.name ?? `Lead #${lead.id}`;

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="h-7 px-2 text-xs"
        disabled={isPending}
        onClick={() => onDecide(lead, LeadStatus.LOST, "no_response")}
      >
        Lost: no response
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            disabled={isPending}
            aria-label={`Other outcomes for ${leadLabel}`}
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onDecide(lead, LeadStatus.LOST)}>
            Lost for another reason...
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDecide(lead, LeadStatus.WON)}>
            Mark as won
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
