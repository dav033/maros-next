import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { money } from "../widgets/formatters";
import type { ClientScorecardRow } from "./useClientScorecard";

const DAY_MS = 86_400_000;
const AVG_MONTH_DAYS = 30.44;

/** A client we keep winning, a client we keep estimating for nothing, or neither. */
type ClientSignal = "proven" | "drain" | "neutral";

/**
 * `closeRate` is a fraction, and `null` is not zero: a new client with three open
 * leads has decided nothing yet. Both end up as "0%" if you format them the same
 * way, and then somebody drops a good client off the follow-up list.
 */
function closeRateLabel(row: ClientScorecardRow): string {
  if (row.closeRate === null) return "Not decided yet";
  return `${Math.round(row.closeRate * 100)}%`;
}

function clientSignal(row: ClientScorecardRow): ClientSignal {
  // Two decisions is the floor for calling anything a pattern: 1/1 is luck, and
  // 0/1 is a single lost bid, not a client who burns estimating hours.
  if (row.decidedCount < 2) return "neutral";
  if (row.wonCount === 0) return "drain";
  if (row.closeRate !== null && row.closeRate >= 0.5) return "proven";
  return "neutral";
}

const signalStyles: Record<ClientSignal, { row: string; rate: string }> = {
  proven: {
    row: "border-l-emerald-500",
    rate: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  },
  drain: {
    row: "border-l-rose-500",
    rate: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
  },
  neutral: {
    row: "border-l-transparent",
    rate: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  },
};

const UNDECIDED_RATE_STYLE = "bg-elev-4 text-muted-foreground border border-line-strong";

function daysSince(isoDate: string, now: number): number | null {
  const parsed = Date.parse(`${isoDate}T00:00:00Z`);
  if (!Number.isFinite(parsed)) return null;
  return Math.floor((now - parsed) / DAY_MS);
}

function formatAge(days: number): string {
  if (days <= 0) return "today";
  const months = Math.floor(days / AVG_MONTH_DAYS);
  if (months < 2) return `${days}d ago`;
  if (months < 24) return `${months} mo ago`;
  return `${Math.floor(months / 12)} yr ago`;
}

/** Nothing for a year is a lapsed client; half a year is a relationship going quiet. */
function coolingClass(days: number): string {
  if (days >= 365) return "text-rose-300";
  if (days >= 180) return "text-amber-300";
  return "text-muted-foreground";
}

export function ClientScorecardTable({
  rows,
  now = Date.now(),
}: {
  rows: ClientScorecardRow[];
  now?: number;
}) {
  return (
    <Card className="border-line">
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-display text-xs uppercase tracking-wide text-muted-foreground">
                Client
              </TableHead>
              <TableHead className="font-display text-right text-xs uppercase tracking-wide text-muted-foreground">
                Leads
              </TableHead>
              <TableHead className="font-display text-right text-xs uppercase tracking-wide text-muted-foreground">
                Won / Lost / Open
              </TableHead>
              <TableHead className="font-display text-right text-xs uppercase tracking-wide text-muted-foreground">
                Close rate
              </TableHead>
              <TableHead className="font-display text-right text-xs uppercase tracking-wide text-muted-foreground">
                Value won
              </TableHead>
              <TableHead className="font-display text-right text-xs uppercase tracking-wide text-muted-foreground">
                Last lead
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const signal = clientSignal(row);
              const styles = signalStyles[signal];
              const isUndecided = row.closeRate === null;
              const age = row.lastLeadDate ? daysSince(row.lastLeadDate, now) : null;

              return (
                <TableRow key={row.contactId} className="hover:bg-elev-3">
                  <TableCell className={`border-l-4 ${styles.row}`}>
                    <Link
                      href={`/contact/${row.contactId}`}
                      className="font-medium hover:underline"
                    >
                      {row.contactName ?? `Contact #${row.contactId}`}
                    </Link>
                    {row.companyName ? (
                      <p className="truncate text-xs text-muted-foreground">{row.companyName}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium tabular-nums">
                    {row.leadCount}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    <span className="font-semibold text-emerald-300">{row.wonCount}</span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="text-rose-300">{row.lostCount}</span>
                    <span className="text-muted-foreground"> / {row.openCount}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={`font-display text-xs font-semibold tabular-nums ${
                        isUndecided ? UNDECIDED_RATE_STYLE : styles.rate
                      }`}
                      title={
                        isUndecided
                          ? `No lead decided yet — ${row.openCount} still open`
                          : `${row.wonCount} won of ${row.decidedCount} decided`
                      }
                    >
                      {closeRateLabel(row)}
                    </Badge>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {isUndecided
                        ? `0 of ${row.leadCount} decided`
                        : `${row.wonCount} of ${row.decidedCount} decided`}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium tabular-nums">
                    {money.format(row.estimatedValueWon)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.lastLeadDate && age !== null ? (
                      <>
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {row.lastLeadDate}
                        </span>
                        <p className={`text-[11px] ${coolingClass(age)}`}>{formatAge(age)}</p>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">No date</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
