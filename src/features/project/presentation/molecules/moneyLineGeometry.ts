/**
 * Geometry for MoneyLine: one axis per project, whose track is the contract (the
 * estimate). Every bar is measured against that same axis.
 *
 * The bars this replaces computed `Math.min(100, (Math.abs(value) / estimate) * 100)`,
 * which erased the two readings the business most needs: a cost at 128% of the
 * contract drew exactly like a cost at 100%, and a loss of 40k drew exactly like a
 * profit of 40k. Nothing here clamps and nothing here takes an absolute value — the
 * axis stretches instead, so an overrun crosses the contract edge and a negative
 * value sits to the left of zero.
 */

/**
 * "contract" es la propia cifra del contrato dibujada como barra: ocupa siempre el
 * ancho entero del eje y sirve de regla para las demás. No es una vía de dinero, así
 * que se pinta en neutro y nunca se marca en rojo.
 */
export type MoneyLineBarKind = "contract" | "in" | "out" | "hold";

export type MoneyLineBarInput = {
  label: string;
  value: number | null;
  kind: MoneyLineBarKind;
};

export type MoneyLineBarGeometry = {
  label: string;
  kind: MoneyLineBarKind;
  value: number | null;
  /** Signed share of the contract, in percent. null when the bar can't be scaled. */
  percentOfContract: number | null;
  /** Bar start, as a percentage of the drawn axis. */
  offsetPercent: number;
  /** Bar length, as a percentage of the drawn axis. 0 when there is nothing to draw. */
  lengthPercent: number;
  negative: boolean;
  overContract: boolean;
  /** true when the bar runs past a fixed axis and is drawn cut off at its end. */
  clipped: boolean;
};

export type MoneyLineGeometry = {
  /** false when the estimate is missing or <= 0: the track stays empty. */
  hasContract: boolean;
  /** The 0 gridline, as a percentage of the drawn axis. Above 0 only when a bar is negative. */
  zeroPercent: number;
  /** The 100%-of-contract edge, as a percentage of the drawn axis. */
  contractPercent: number;
  /** Axis bounds in percent-of-contract, for aria-valuemin / aria-valuemax. */
  axisMinPercent: number;
  axisMaxPercent: number;
  bars: MoneyLineBarGeometry[];
};

/**
 * Headroom kept to the right of the contract edge when nothing exceeds it, so the
 * hatched overrun zone is always visible and every healthy row shares one scale.
 */
export /** Sliver kept for a bar clipped to nothing, so it stays visible and hoverable. */
const MIN_CLIPPED_LENGTH_PERCENT = 2;

const DEFAULT_AXIS_MAX_PERCENT = 125;

/**
 * The fixed axis the projects list uses. In a list the whole point of the column is
 * comparing one row against the next, and an axis that grows per row puts the contract
 * marker on a different x in every row — so the list pins it here and cuts off whatever
 * runs past it. A single project card has nothing to compare against, so it keeps the
 * elastic axis and lets the overrun show its real length.
 */
export const LIST_AXIS_MAX_PERCENT = 135;

export type MoneyLineGeometryOptions = {
  /** Pins the right end of the axis, in percent of contract. Omit for an elastic axis. */
  axisMaxPercent?: number;
};

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** One decimal below 1%, so a small non-zero share never prints as a flat "0%". */
export function formatPercentOfContract(percent: number): string {
  return Math.abs(percent) < 1 ? `${percent.toFixed(1)}%` : `${Math.round(percent)}%`;
}

function toPercent(value: number | null, contract: number | null): number | null {
  if (contract === null || value === null || !Number.isFinite(value)) return null;
  return (value / contract) * 100;
}

export function computeMoneyLineGeometry(
  estimate: number | null | undefined,
  bars: MoneyLineBarInput[],
  options: MoneyLineGeometryOptions = {}
): MoneyLineGeometry {
  // A missing estimate is not a zero estimate: without a contract there is no axis to
  // scale against, so the track stays empty instead of reading as "nothing spent".
  const contract =
    typeof estimate === "number" && Number.isFinite(estimate) && estimate > 0 ? estimate : null;

  const percents = bars.map((bar) => toPercent(bar.value, contract));

  // A pinned axis is the same in every row, so both its ends are fixed and the bars
  // that fall outside are cut off. Without one the axis grows to whatever the data
  // needs and the data is never shrunk to fit it.
  const fixedMaxPercent =
    typeof options.axisMaxPercent === "number" &&
    Number.isFinite(options.axisMaxPercent) &&
    options.axisMaxPercent > 0
      ? options.axisMaxPercent
      : null;

  const axisMaxPercent =
    fixedMaxPercent ??
    percents.reduce<number>(
      (max, percent) => (percent !== null && percent > max ? percent : max),
      DEFAULT_AXIS_MAX_PERCENT
    );
  const axisMinPercent =
    fixedMaxPercent !== null
      ? 0
      : percents.reduce<number>(
          (min, percent) => (percent !== null && percent < min ? percent : min),
          0
        );
  const span = axisMaxPercent - axisMinPercent;
  const position = (percent: number) => ((percent - axisMinPercent) / span) * 100;
  const zeroPercent = round(position(0));

  return {
    hasContract: contract !== null,
    zeroPercent,
    contractPercent: round(position(100)),
    axisMinPercent: round(axisMinPercent),
    axisMaxPercent: round(axisMaxPercent),
    bars: bars.map((bar, index) => {
      const percentOfContract = percents[index];
      if (percentOfContract === null) {
        return {
          label: bar.label,
          kind: bar.kind,
          value: bar.value,
          percentOfContract: null,
          offsetPercent: zeroPercent,
          lengthPercent: 0,
          negative: false,
          overContract: false,
          clipped: false,
        };
      }

      // Only a fixed axis can be too short for the data: the drawn bar stops at the
      // axis end and says so, while percentOfContract keeps reporting the real share.
      const drawnPercent = Math.min(Math.max(percentOfContract, axisMinPercent), axisMaxPercent);
      const edge = round(position(drawnPercent));
      const negative = percentOfContract < 0;
      const clipped = drawnPercent !== percentOfContract;
      const rawLength = Math.abs(edge - zeroPercent);
      // Clipped to nothing renders as a zero-width element: no colour, and nothing to
      // hover, so its title never reaches a mouse user. That is the silent clip this
      // whole function exists to prevent, just at the other end. Keep a sliver; the
      // figure, the title and aria-valuenow still carry the real number.
      const lengthPercent = round(
        clipped ? Math.max(rawLength, MIN_CLIPPED_LENGTH_PERCENT) : rawLength
      );
      return {
        label: bar.label,
        kind: bar.kind,
        value: bar.value,
        percentOfContract: round(percentOfContract),
        offsetPercent: negative ? edge : zeroPercent,
        lengthPercent,
        negative,
        overContract: percentOfContract > 100,
        clipped,
      };
    }),
  };
}
