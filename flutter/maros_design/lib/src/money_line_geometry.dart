/// Geometry for MoneyLine: one axis per project, whose track is the contract (the
/// estimate). Every bar is measured against that same axis.
///
/// Literal port of
/// `maros-next/src/features/project/presentation/molecules/moneyLineGeometry.ts`.
/// The original's own preamble, kept because it is the reason the file exists:
///
/// > The bars this replaces computed `Math.min(100, (Math.abs(value) / estimate)
/// > * 100)`, which erased the two readings the business most needs: a cost at
/// > 128% of the contract drew exactly like a cost at 100%, and a loss of 40k
/// > drew exactly like a profit of 40k. Nothing here clamps and nothing here
/// > takes an absolute value — the axis stretches instead, so an overrun crosses
/// > the contract edge and a negative value sits to the left of zero.
///
/// This file is pure arithmetic: no Flutter imports, no painting, no formatting
/// of money. That is deliberate — it is the part that can be tested without a
/// screen, and it is the part that must not drift from the web.
// The unnamed `library;` directive only exists to give the doc comment above
// something to attach to (an unnamed library directive is valid from Dart 2.19).
library;

/// Which lane a bar belongs to.
///
/// The TypeScript union is `"in" | "out" | "hold"`. `in` is a reserved word in
/// Dart, so the two cash lanes are spelled out; the third keeps its name. The
/// doc comments carry the web's name so the two can be matched up.
enum MoneyLineBarKind {
  /// TS `"in"` — cash collected from the client.
  cashIn,

  /// TS `"out"` — cash actually paid out.
  cashOut,

  /// TS `"hold"` — contracted work not executed / not invoiced yet.
  hold,
}

/// One lane's input: a label, an amount that may be missing, and its lane.
class MoneyLineBarInput {
  const MoneyLineBarInput({
    required this.label,
    required this.value,
    required this.kind,
  });

  final String label;

  /// `null` means "no data", which is NOT zero. See [MoneyLineGeometry].
  final double? value;

  final MoneyLineBarKind kind;
}

/// One lane's computed geometry. All percentages are percentages OF THE DRAWN
/// AXIS unless the name says otherwise.
class MoneyLineBarGeometry {
  const MoneyLineBarGeometry({
    required this.label,
    required this.kind,
    required this.value,
    required this.percentOfContract,
    required this.offsetPercent,
    required this.lengthPercent,
    required this.negative,
    required this.overContract,
    required this.clipped,
  });

  final String label;
  final MoneyLineBarKind kind;
  final double? value;

  /// Signed share of the contract, in percent. `null` when the bar can't be
  /// scaled (no contract, or no value). This is the REAL share and is never
  /// clamped, even when the drawn bar is cut off.
  final double? percentOfContract;

  /// Bar start, as a percentage of the drawn axis.
  final double offsetPercent;

  /// Bar length, as a percentage of the drawn axis. 0 when there is nothing to
  /// draw.
  final double lengthPercent;

  final bool negative;
  final bool overContract;

  /// true when the bar runs past a fixed axis and is drawn cut off at its end.
  final bool clipped;
}

/// The whole axis: where zero is, where the contract edge is, the bounds, and
/// every lane.
class MoneyLineGeometry {
  const MoneyLineGeometry({
    required this.hasContract,
    required this.zeroPercent,
    required this.contractPercent,
    required this.axisMinPercent,
    required this.axisMaxPercent,
    required this.bars,
  });

  /// false when the estimate is missing or <= 0: the track stays empty.
  final bool hasContract;

  /// The 0 gridline, as a percentage of the drawn axis. Above 0 only when a bar
  /// is negative.
  final double zeroPercent;

  /// The 100%-of-contract edge, as a percentage of the drawn axis.
  final double contractPercent;

  /// Axis bounds in percent-of-contract, for the accessibility min/max
  /// (`aria-valuemin` / `aria-valuemax` on the web).
  final double axisMinPercent;
  final double axisMaxPercent;

  final List<MoneyLineBarGeometry> bars;
}

/// Sliver kept for a bar clipped to nothing, so it stays visible and hoverable.
const double kMinClippedLengthPercent = 2.0;

/// Headroom kept to the right of the contract edge when nothing exceeds it, so
/// the hatched overrun zone is always visible and every healthy row shares one
/// scale.
const double _kDefaultAxisMaxPercent = 125.0;

/// The fixed axis the projects list uses. In a list the whole point of the column
/// is comparing one row against the next, and an axis that grows per row puts the
/// contract marker on a different x in every row — so the list pins it here and
/// cuts off whatever runs past it. A single project card has nothing to compare
/// against, so it keeps the elastic axis and lets the overrun show its real
/// length.
const double kListAxisMaxPercent = 135.0;

/// Rounds to three decimals the way the TypeScript does.
///
/// JS `Math.round(x)` is defined as `floor(x + 0.5)`: ties go UP, towards
/// +Infinity. Dart's `num.round()` rounds ties AWAY FROM ZERO, so the two
/// disagree on negatives (`Math.round(-0.5)` is `-0`, but `(-0.5).round()` is
/// `-1`). Negative percentages are ordinary here (a loss), so the JS rule is
/// reproduced literally with floor.
///
/// `floorToDouble` is used rather than `floor()` because the latter throws on
/// infinity and NaN, and this function must stay total.
double _round3(double value) {
  return (value * 1000.0 + 0.5).floorToDouble() / 1000.0;
}

/// One decimal below 1%, so a small non-zero share never prints as a flat "0%".
///
/// Port of `formatPercentOfContract`. `toStringAsFixed(1)` matches JS
/// `toFixed(1)`. The integer branch uses the same JS rounding rule as [_round3]
/// (`Math.round`, i.e. floor(x + 0.5)), not Dart's `round()`, so a share of
/// -120.5% prints as -120% on both platforms instead of -120% on one and -121%
/// on the other.
String formatPercentOfContract(double percent) {
  if (percent.abs() < 1.0) {
    return percent.toStringAsFixed(1) + '%';
  }
  final double rounded = (percent + 0.5).floorToDouble();
  // `+ 0.0` normalises a negative zero away: JS prints String(-0) as "0", and
  // (-0.0).toInt() is 0 in Dart, but being explicit keeps the intent visible.
  return (rounded + 0.0).toInt().toString() + '%';
}

/// Signed share of [contract] represented by [value], in percent, or null when it
/// cannot be computed.
double? _toPercent(double? value, double? contract) {
  if (contract == null || value == null || !value.isFinite) return null;
  final double result = (value / contract) * 100.0;
  // Un contrato diminuto frente a un importe enorme da un porcentaje infinito.
  // El TypeScript lo imprime como "Infinity%" y sigue; en Dart `double.toInt()`
  // LANZA UnsupportedError sobre un valor no finito y se lleva por delante el
  // widget entero. Un porcentaje no computable es exactamente lo que `null` ya
  // significa aqui, asi que se trata igual: pista vacia, sin inventar una cifra.
  if (!result.isFinite) return null;
  return result;
}

/// Options for [computeMoneyLineGeometry].
class MoneyLineGeometryOptions {
  const MoneyLineGeometryOptions({this.axisMaxPercent});

  /// Pins the right end of the axis, in percent of contract. Omit (or pass null)
  /// for an elastic axis.
  final double? axisMaxPercent;
}

/// Computes the axis and every lane.
///
/// [estimate] is the contract amount. In TypeScript this parameter accepts both
/// `null` and `undefined`; Dart has only `null`, and both mean the same thing
/// here — no contract.
MoneyLineGeometry computeMoneyLineGeometry(
  double? estimate,
  List<MoneyLineBarInput> bars, [
  MoneyLineGeometryOptions options = const MoneyLineGeometryOptions(),
]) {
  // A missing estimate is not a zero estimate: without a contract there is no
  // axis to scale against, so the track stays empty instead of reading as
  // "nothing spent".
  final double? contract =
      (estimate != null && estimate.isFinite && estimate > 0) ? estimate : null;

  final List<double?> percents = <double?>[];
  for (int i = 0; i < bars.length; i++) {
    percents.add(_toPercent(bars[i].value, contract));
  }

  // A pinned axis is the same in every row, so both its ends are fixed and the
  // bars that fall outside are cut off. Without one the axis grows to whatever
  // the data needs and the data is never shrunk to fit it.
  final double? optionMax = options.axisMaxPercent;
  final double? fixedMaxPercent =
      (optionMax != null && optionMax.isFinite && optionMax > 0) ? optionMax : null;

  double axisMaxPercent;
  double axisMinPercent;
  if (fixedMaxPercent != null) {
    axisMaxPercent = fixedMaxPercent;
    axisMinPercent = 0.0;
  } else {
    axisMaxPercent = _kDefaultAxisMaxPercent;
    axisMinPercent = 0.0;
    for (int i = 0; i < percents.length; i++) {
      final double? percent = percents[i];
      // A null percent is skipped, so a missing value can neither stretch nor
      // shrink the axis the other bars share.
      if (percent == null) continue;
      if (percent > axisMaxPercent) axisMaxPercent = percent;
      if (percent < axisMinPercent) axisMinPercent = percent;
    }
  }

  final double span = axisMaxPercent - axisMinPercent;
  // span is always >= 125 on the elastic axis (the default max only grows and the
  // min only shrinks) and equals the pinned max (> 0) on the fixed one, so it is
  // never zero and this division is safe.
  double position(double percent) => ((percent - axisMinPercent) / span) * 100.0;

  final double zeroPercent = _round3(position(0.0));

  final List<MoneyLineBarGeometry> computedBars = <MoneyLineBarGeometry>[];
  for (int index = 0; index < bars.length; index++) {
    final MoneyLineBarInput bar = bars[index];
    final double? percentOfContract = percents[index];

    if (percentOfContract == null) {
      computedBars.add(
        MoneyLineBarGeometry(
          label: bar.label,
          kind: bar.kind,
          value: bar.value,
          percentOfContract: null,
          offsetPercent: zeroPercent,
          lengthPercent: 0.0,
          negative: false,
          overContract: false,
          clipped: false,
        ),
      );
      continue;
    }

    // Only a fixed axis can be too short for the data: the drawn bar stops at the
    // axis end and says so, while percentOfContract keeps reporting the real
    // share. Written as two explicit comparisons rather than clamp() so the
    // behaviour is readable and matches Math.min(Math.max(...)).
    double drawnPercent = percentOfContract;
    if (drawnPercent < axisMinPercent) drawnPercent = axisMinPercent;
    if (drawnPercent > axisMaxPercent) drawnPercent = axisMaxPercent;

    final double edge = _round3(position(drawnPercent));
    final bool negative = percentOfContract < 0;
    final bool clipped = drawnPercent != percentOfContract;
    final double rawLength = (edge - zeroPercent).abs();
    // Clipped to nothing renders as a zero-width element: no colour, and nothing
    // to hover, so its label never reaches a pointer user. That is the silent
    // clip this whole function exists to prevent, just at the other end. Keep a
    // sliver; the figure, the tooltip and the semantics value still carry the
    // real number.
    final double lengthPercent = _round3(
      clipped && rawLength < kMinClippedLengthPercent
          ? kMinClippedLengthPercent
          : rawLength,
    );

    computedBars.add(
      MoneyLineBarGeometry(
        label: bar.label,
        kind: bar.kind,
        value: bar.value,
        percentOfContract: _round3(percentOfContract),
        offsetPercent: negative ? edge : zeroPercent,
        lengthPercent: lengthPercent,
        negative: negative,
        overContract: percentOfContract > 100,
        clipped: clipped,
      ),
    );
  }

  return MoneyLineGeometry(
    hasContract: contract != null,
    zeroPercent: zeroPercent,
    contractPercent: _round3(position(100.0)),
    axisMinPercent: _round3(axisMinPercent),
    axisMaxPercent: _round3(axisMaxPercent),
    bars: computedBars,
  );
}
