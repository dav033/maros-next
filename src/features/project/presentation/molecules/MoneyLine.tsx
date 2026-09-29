"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/shared/utils";

import {
  computeMoneyLineGeometry,
  formatPercentOfContract,
  type MoneyLineBarGeometry,
  type MoneyLineBarInput,
  type MoneyLineBarKind,
} from "./moneyLineGeometry";

const KIND_COLOR: Record<MoneyLineBarKind, string> = {
  contract: "var(--fg-faint)",
  in: "var(--money-in)",
  out: "var(--money-out)",
  hold: "var(--money-hold)",
};

// Everything to the right of the contract edge, striped so the zone reads as "outside
// the contract" even before a bar reaches it. Built from --money-over so it needs no
// second token, and drawn under the bars.
const OVERRUN_HATCH =
  "repeating-linear-gradient(45deg, color-mix(in srgb, var(--money-over) 24%, transparent) 0 3px, transparent 3px 6px)";

// The cut edge of a bar that runs past a fixed axis: the track colour bitten out of the
// bar, so "it goes off the chart" can never be read as "it stops here".
const CLIP_EDGE =
  "repeating-linear-gradient(-45deg, var(--money-track) 0 1px, transparent 1px 3px)";

function barColor(bar: MoneyLineBarGeometry): string {
  // La barra del contrato es la regla, no una vía de dinero: nunca se alarma de sí misma.
  if (bar.kind === "contract") return KIND_COLOR.contract;
  // A negative lane is money lost whatever it is. Past the contract is only alarming
  // when the money is going out: collecting or holding more than the contract is good
  // news (change orders, released retainage), and the contract marker already shows it.
  if (bar.negative || (bar.overContract && bar.kind === "out")) return "var(--money-over)";
  return KIND_COLOR[bar.kind];
}

function barTitle(bar: MoneyLineBarGeometry): string {
  if (bar.value === null) return `${bar.label}: no data`;
  const amount = formatCurrency(bar.value);
  if (bar.percentOfContract === null) return `${bar.label}: ${amount} · no contract amount`;
  const share = `${bar.label}: ${amount} · ${formatPercentOfContract(bar.percentOfContract)} of contract`;
  return bar.clipped ? `${share} · runs off the end of the axis` : share;
}

export type MoneyLineProps = {
  /** Contract amount; it defines the width of the track. null or <= 0 leaves it empty. */
  estimate: number | null;
  /**
   * Dibuja el propio contrato como primera barra, a lo ancho de todo el eje. Sirve de
   * regla y, sobre todo, pone su monto en la leyenda: sin ella el contrato es un eje
   * invisible y la fila no dice contra qué se están midiendo las demás cifras.
   */
  showContract?: boolean;
  /** Cash received from the client. Omit it to leave that lane out. */
  collected?: number | null;
  /** Cash actually paid out. Omit it where the data source cannot supply it. */
  spent?: number | null;
  /** Cobrado menos gastado. Omitir donde no haya sitio para la barra. */
  profit?: number | null;
  /** Contracted work not invoiced yet. Pass it only where there is room for a third bar. */
  backlog?: number | null;
  /**
   * Pins the right end of the axis, in percent of contract. Pass LIST_AXIS_MAX_PERCENT
   * in lists, so the contract marker lands on the same x in every row and the rows can
   * be compared; leave it out on a single project, which has nothing to compare against
   * and is better served by an axis that stretches to show the whole overrun.
   */
  axisMaxPercent?: number;
  /** Accessible name for the axis, normally the project name. */
  label?: string;
  className?: string;
};

/**
 * One axis per project: the track is the contract, and collected / spent (plus backlog
 * on the project card) are drawn against that same axis instead of each against
 * itself. The contract edge is marked on top of the bars — a bar that crosses it would
 * otherwise paint over the very line it is crossing.
 */
export function MoneyLine({
  estimate,
  showContract,
  collected,
  spent,
  profit,
  backlog,
  axisMaxPercent,
  label,
  className,
}: MoneyLineProps) {
  const inputs: MoneyLineBarInput[] = [
    ...(showContract
      ? [{ label: "Contract", value: estimate ?? null, kind: "contract" as const }]
      : []),
    ...(collected === undefined
      ? []
      : [{ label: "Collected", value: collected, kind: "in" as const }]),
    ...(spent === undefined ? [] : [{ label: "Spent", value: spent, kind: "out" as const }]),
    ...(profit === undefined ? [] : [{ label: "Profit", value: profit, kind: "in" as const }]),
    ...(backlog === undefined
      ? []
      : [{ label: "Backlog", value: backlog, kind: "hold" as const }]),
  ];
  const geometry = computeMoneyLineGeometry(estimate, inputs, { axisMaxPercent });

  return (
    <div className={cn("min-w-[120px]", className)}>
      <div
        className="relative flex flex-col gap-0.5"
        role="group"
        aria-label={label ? `${label} against contract` : "Amounts against contract"}
      >
        {geometry.bars.map((bar) => (
          <div
            key={bar.label}
            className="relative h-2 overflow-hidden"
            style={{ backgroundColor: "var(--money-track)", borderRadius: "var(--shape-xs)" }}
          >
            {geometry.hasContract ? (
              <div
                aria-hidden="true"
                className="absolute inset-y-0 right-0"
                style={{ left: `${geometry.contractPercent}%`, backgroundImage: OVERRUN_HATCH }}
              />
            ) : null}
            {bar.percentOfContract === null ? null : (
              <div
                role="progressbar"
                aria-label={`${bar.label} as a percentage of the contract`}
                // The value can sit outside a fixed axis, and a progressbar whose
                // value is outside its own range is meaningless: the bounds follow
                // the value when it runs off the drawn axis.
                aria-valuemin={Math.min(geometry.axisMinPercent, bar.percentOfContract)}
                aria-valuemax={Math.max(geometry.axisMaxPercent, bar.percentOfContract)}
                aria-valuenow={bar.percentOfContract}
                aria-valuetext={barTitle(bar)}
                title={barTitle(bar)}
                className="absolute inset-y-0"
                style={{
                  left: `${bar.offsetPercent}%`,
                  width: `${bar.lengthPercent}%`,
                  backgroundColor: barColor(bar),
                  borderRadius: "var(--shape-xs)",
                }}
              />
            )}
            {bar.clipped ? (
              <div
                aria-hidden="true"
                data-clipped="true"
                className="pointer-events-none absolute inset-y-0 w-1"
                style={{
                  ...(bar.negative ? { left: 0 } : { right: 0 }),
                  backgroundImage: CLIP_EDGE,
                }}
              />
            ) : null}
          </div>
        ))}
        {geometry.hasContract ? (
          <div
            aria-hidden="true"
            data-contract-marker="true"
            className="pointer-events-none absolute inset-y-0 w-px"
            style={{
              left: `${geometry.contractPercent}%`,
              backgroundColor: "var(--line-strong)",
            }}
          />
        ) : null}
        {geometry.zeroPercent > 0 ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-px"
            style={{ left: `${geometry.zeroPercent}%`, backgroundColor: "var(--line-strong)" }}
          />
        ) : null}
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] leading-3">
        {geometry.bars.map((bar) => (
          <span key={bar.label} className="inline-flex items-center gap-1" title={barTitle(bar)}>
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full"
              style={{ backgroundColor: barColor(bar) }}
            />
            {/* The colour alone never says which lane this is; the label is printed. */}
            <span style={{ color: "var(--fg-faint)" }}>{bar.label}</span>
            <span
              className="font-mono tabular-nums"
              style={{ color: bar.value === null ? "var(--fg-faint)" : "var(--fg-dim)" }}
            >
              {bar.value === null ? "—" : formatCurrency(bar.value)}
            </span>
          </span>
        ))}
      </div>
      {geometry.hasContract ? null : (
        <p className="mt-0.5 text-[10px] leading-3" style={{ color: "var(--fg-faint)" }}>
          No contract amount to scale against
        </p>
      )}
    </div>
  );
}
