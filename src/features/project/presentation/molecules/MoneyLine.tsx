"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/shared/utils";

import {
  computeMoneyLineGeometry,
  formatPercentOfContract,
  type MoneyLineBarGeometry,
  type MoneyLineBarInput,
  type MoneyLineBarKind,
  type MoneyLineGeometry,
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

/** True when the bar is bad news: money lost, or money going out past the contract. */
function isAlarm(bar: MoneyLineBarGeometry): boolean {
  // La barra del contrato es la regla, no una vía de dinero: nunca se alarma de sí misma.
  if (bar.kind === "contract") return false;
  // A negative lane is money lost whatever it is. Past the contract is only alarming
  // when the money is going out: collecting or holding more than the contract is good
  // news (change orders, released retainage), and the contract marker already shows it.
  return bar.negative || (bar.overContract && bar.kind === "out");
}

function barColor(bar: MoneyLineBarGeometry): string {
  if (isAlarm(bar)) return "var(--money-over)";
  return KIND_COLOR[bar.kind];
}

function barTitle(bar: MoneyLineBarGeometry): string {
  if (bar.value === null) return `${bar.label}: no data`;
  const amount = formatCurrency(bar.value);
  if (bar.percentOfContract === null) return `${bar.label}: ${amount} · no contract amount`;
  const share = `${bar.label}: ${amount} · ${formatPercentOfContract(bar.percentOfContract)} of contract`;
  return bar.clipped ? `${share} · runs off the end of the axis` : share;
}

/**
 * The track of one bar: the empty rail, the out-of-contract hatch, the bar itself and
 * the cut mark. `withMarkers` draws the contract edge and the zero line inside this
 * same rail; the strip layout instead draws them once across the whole stack.
 */
function MoneyLineTrack({
  bar,
  geometry,
  withMarkers,
  className,
}: {
  bar: MoneyLineBarGeometry;
  geometry: MoneyLineGeometry;
  withMarkers?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
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
      {withMarkers && geometry.hasContract ? (
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
      {withMarkers && geometry.zeroPercent > 0 ? (
        <div
          aria-hidden="true"
          data-zero-marker="true"
          className="pointer-events-none absolute inset-y-0 w-px"
          style={{ left: `${geometry.zeroPercent}%`, backgroundColor: "var(--line-strong)" }}
        />
      ) : null}
    </div>
  );
}

export type MoneyLineLayout = "strip" | "rows";

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
  /**
   * "strip" (por defecto) apila las barras pegadas y pone las cifras en una leyenda
   * debajo: denso, para una tarjeta donde el título ya dice de qué va.
   *
   * "rows" es la disposición que la lista de proyectos tenía antes del rediseño y a la
   * que se vuelve: cada barra lleva encima su etiqueta a la izquierda y su cifra a la
   * derecha, alineadas en columna. Se lee de un vistazo qué es cada barra sin cruzar
   * colores con una leyenda.
   */
  layout?: MoneyLineLayout;
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
  layout = "strip",
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

  const noContractNote = geometry.hasContract ? null : (
    <p className="mt-1 text-[10px] leading-3" style={{ color: "var(--fg-faint)" }}>
      No contract amount to scale against
    </p>
  );

  if (layout === "rows") {
    return (
      <div className={cn("min-w-[188px]", className)}>
        <div
          className="flex flex-col gap-1.5"
          role="group"
          aria-label={label ? `${label} against contract` : "Amounts against contract"}
        >
          {geometry.bars.map((bar) => {
            const alarm = isAlarm(bar);
            return (
              <div key={bar.label} className="space-y-1" title={barTitle(bar)}>
                <div className="flex items-baseline justify-between gap-2 leading-none">
                  <span
                    className="truncate text-[11px]"
                    style={{ color: "var(--fg-faint)" }}
                  >
                    {bar.label}
                  </span>
                  <span className="flex items-baseline gap-1">
                    {/* El porcentaje sólo se imprime donde la barra por sí sola podría
                        leerse mal: sobrecosto o cifra negativa. En lo normal estorba. */}
                    {alarm && bar.percentOfContract !== null ? (
                      <span
                        className="rounded-[3px] px-1 font-mono text-[9px] leading-[14px] tabular-nums"
                        style={{
                          color: "var(--money-over)",
                          backgroundColor:
                            "color-mix(in srgb, var(--money-over) 16%, transparent)",
                        }}
                      >
                        {formatPercentOfContract(bar.percentOfContract)}
                      </span>
                    ) : null}
                    <span
                      className="whitespace-nowrap font-mono text-[11px] font-medium tabular-nums"
                      style={{
                        color:
                          bar.value === null
                            ? "var(--fg-faint)"
                            : alarm
                              ? "var(--money-over)"
                              : "var(--fg)",
                      }}
                    >
                      {bar.value === null ? "—" : formatCurrency(bar.value)}
                    </span>
                  </span>
                </div>
                <MoneyLineTrack bar={bar} geometry={geometry} withMarkers className="h-1.5" />
              </div>
            );
          })}
        </div>
        {noContractNote}
      </div>
    );
  }

  return (
    <div className={cn("min-w-[120px]", className)}>
      <div
        className="relative flex flex-col gap-0.5"
        role="group"
        aria-label={label ? `${label} against contract` : "Amounts against contract"}
      >
        {geometry.bars.map((bar) => (
          <MoneyLineTrack key={bar.label} bar={bar} geometry={geometry} className="h-2" />
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
            data-zero-marker="true"
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
      {noContractNote}
    </div>
  );
}
