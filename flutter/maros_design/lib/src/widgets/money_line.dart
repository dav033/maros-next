import 'package:flutter/material.dart';

import '../format/currency.dart';
import '../money_line_geometry.dart';
import '../tokens/colors.dart';
import '../tokens/shape.dart';
import '../tokens/typography.dart';

/// Wrapper that lets an optional lane tell "this lane does not exist here" apart
/// from "this lane exists but has no data".
///
/// TypeScript can tell `spent === undefined` (do not draw the lane at all) from
/// `spent === null` (draw the lane, print an em dash) because it has two empty
/// values. Dart has one, so presence of the WRAPPER carries the first bit and its
/// [value] carries the second:
///
///   * `spent: null` — no Spent lane, like omitting the prop on the web;
///   * `spent: MoneyValue.noData` — a Spent lane that reads "—";
///   * `spent: MoneyValue(1250.0)` — a Spent lane of $1,250.00.
class MoneyValue {
  const MoneyValue(this.value);

  /// The lane exists, but the data source had nothing for it.
  static const MoneyValue noData = MoneyValue(null);

  final double? value;
}

/// One axis per project: the track is the contract, and collected / spent (plus
/// backlog on a project card) are drawn against that same axis instead of each
/// against itself.
///
/// ---------------------------------------------------------------------------
/// WHY WIDGETS AND NOT ONE CustomPainter
/// ---------------------------------------------------------------------------
/// The picture is easy either way; the non-visual parts are not. Every lane has
/// to reach the accessibility tree as its own node (the web gives each bar
/// `role="progressbar"` with a value) and has to answer a pointer (the web gives
/// each bar a `title`). With widgets that is a `Semantics` and a `Tooltip` per
/// lane and nothing else. With a single painter it would mean hand-writing
/// `CustomPainter.semanticsBuilder` and hit testing to get back what the
/// framework already does — much more code, all of it untestable here.
///
/// So: composition, plus two small [CustomPainter]s for the one thing widgets
/// genuinely cannot express, diagonal stripes (the overrun hatch and the cut
/// edge).
///
/// Order in the [Stack] is load-bearing: the contract marker is added LAST, so it
/// paints ON TOP of the bars. A bar that crosses the contract edge would
/// otherwise paint over the very line it is crossing, and the marker is the whole
/// point of the widget.
class MoneyLine extends StatelessWidget {
  const MoneyLine({
    super.key,
    required this.estimate,
    required this.collected,
    this.spent,
    this.backlog,
    this.axisMaxPercent,
    this.label,
    this.barHeight = 8.0,
    this.barGap = 2.0,
    this.minWidth = 120.0,
  });

  /// Contract amount; it defines the width of the track. null or <= 0 leaves it
  /// empty — "no data" is not "zero".
  final double? estimate;

  /// Cash received from the client. Always drawn.
  final double? collected;

  /// Cash actually paid out. Leave null where the data source cannot supply the
  /// lane at all; pass [MoneyValue.noData] where the lane exists but is empty.
  final MoneyValue? spent;

  /// Contracted work not invoiced yet. Pass it only where there is room for a
  /// third bar.
  final MoneyValue? backlog;

  /// Pins the right end of the axis, in percent of contract. Pass
  /// [kListAxisMaxPercent] in lists, so the contract marker lands on the same x
  /// in every row and the rows can be compared; leave it out on a single project,
  /// which has nothing to compare against and is better served by an axis that
  /// stretches to show the whole overrun.
  final double? axisMaxPercent;

  /// Accessible name for the axis, normally the project name.
  final String? label;

  /// Height of one lane. `h-2` on the web = 8px.
  final double barHeight;

  /// Vertical gap between lanes. `gap-0.5` on the web = 2px.
  final double barGap;

  /// `min-w-[120px]` on the web, and the width assumed when the parent gives this
  /// widget unbounded width (in a Row without Expanded, for instance), because
  /// percentages of infinity are not a picture.
  final double minWidth;

  @override
  Widget build(BuildContext context) {
    final List<MoneyLineBarInput> inputs = <MoneyLineBarInput>[
      MoneyLineBarInput(
        label: 'Collected',
        value: collected,
        kind: MoneyLineBarKind.cashIn,
      ),
      if (spent != null)
        MoneyLineBarInput(
          label: 'Spent',
          value: spent!.value,
          kind: MoneyLineBarKind.cashOut,
        ),
      if (backlog != null)
        MoneyLineBarInput(
          label: 'Backlog',
          value: backlog!.value,
          kind: MoneyLineBarKind.hold,
        ),
    ];

    final MoneyLineGeometry geometry = computeMoneyLineGeometry(
      estimate,
      inputs,
      MoneyLineGeometryOptions(axisMaxPercent: axisMaxPercent),
    );

    return ConstrainedBox(
      constraints: BoxConstraints(minWidth: minWidth),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // The equivalent of the web's role="group" + aria-label: one named
          // container holding the lanes, with the lanes still exposed
          // individually (explicitChildNodes) rather than merged into one string.
          Semantics(
            container: true,
            explicitChildNodes: true,
            label: (label == null || label!.isEmpty)
                ? 'Amounts against contract'
                : '$label against contract',
            child: LayoutBuilder(
              builder: (BuildContext context, BoxConstraints constraints) {
                final double width =
                    (constraints.hasBoundedWidth && constraints.maxWidth > 0)
                        ? constraints.maxWidth
                        : minWidth;
                return _buildAxis(geometry, width);
              },
            ),
          ),
          const SizedBox(height: 2.0), // mt-0.5
          _buildLegend(geometry),
          if (!geometry.hasContract) ...<Widget>[
            const SizedBox(height: 2.0),
            const Text(
              'No contract amount to scale against',
              style: MarosTypography.legendLabel,
            ),
          ],
        ],
      ),
    );
  }

  /// The stack of lanes, with the contract marker and the zero gridline drawn on
  /// top of every lane.
  Widget _buildAxis(MoneyLineGeometry geometry, double width) {
    final int laneCount = geometry.bars.length;
    final double height =
        laneCount == 0 ? 0.0 : laneCount * barHeight + (laneCount - 1) * barGap;

    final List<Widget> layers = <Widget>[];
    for (int i = 0; i < laneCount; i++) {
      layers.add(
        Positioned(
          left: 0.0,
          top: i * (barHeight + barGap),
          width: width,
          height: barHeight,
          child: _buildLane(geometry, geometry.bars[i], width),
        ),
      );
    }

    // --- Added last on purpose: these two rules paint above the bars. ---
    if (geometry.hasContract) {
      layers.add(
        _rule(x: _px(geometry.contractPercent, width), height: height),
      );
    }
    // Zero only gets its own gridline when it is not the left edge, i.e. when
    // some bar is negative and the axis had to open up to the left of zero.
    if (geometry.zeroPercent > 0) {
      layers.add(_rule(x: _px(geometry.zeroPercent, width), height: height));
    }

    return SizedBox(
      width: width,
      height: height,
      child: Stack(children: layers),
    );
  }

  /// A 1px vertical rule: the contract marker or the zero gridline.
  ///
  /// Decorative and non-interactive, like the web's `aria-hidden` +
  /// `pointer-events-none`: it must never swallow a hover meant for the bar
  /// underneath it, and it must never be announced.
  Widget _rule({required double x, required double height}) {
    return Positioned(
      left: x,
      top: 0.0,
      width: 1.0,
      height: height,
      child: const IgnorePointer(
        child: ExcludeSemantics(
          child: ColoredBox(color: MarosColors.lineStrong),
        ),
      ),
    );
  }

  /// One lane: the empty track, the hatched out-of-contract zone under the bar,
  /// the bar, and the cut-edge indicator.
  Widget _buildLane(
    MoneyLineGeometry geometry,
    MoneyLineBarGeometry bar,
    double width,
  ) {
    final List<Widget> layers = <Widget>[
      // The empty track. With no contract this is all a lane ever shows.
      const Positioned.fill(child: ColoredBox(color: MarosMoneyColors.track)),
    ];

    if (geometry.hasContract) {
      // Everything right of the contract edge, striped, so the zone reads as
      // "outside the contract" even before a bar reaches it. Drawn UNDER the bar.
      layers.add(
        Positioned(
          left: _px(geometry.contractPercent, width),
          top: 0.0,
          right: 0.0,
          bottom: 0.0,
          child: const IgnorePointer(
            child: ExcludeSemantics(
              child: CustomPaint(painter: _OverrunHatchPainter()),
            ),
          ),
        ),
      );
    }

    if (bar.percentOfContract != null) {
      final String description = _barDescription(bar);
      layers.add(
        Positioned(
          // Not clamped: a bar's own geometry is already inside the axis by
          // construction, and nudging it would falsify the picture.
          left: width * bar.offsetPercent / 100.0,
          top: 0.0,
          width: width * bar.lengthPercent / 100.0,
          height: barHeight,
          child: Tooltip(
            // The web's `title` attribute.
            message: description,
            child: Semantics(
              container: true,
              // Flutter has no "progressbar" role to set, so this is the closest
              // equivalent of role="progressbar" + aria-valuenow: a named node
              // whose `value` is the share of the contract, which is what
              // Material's own LinearProgressIndicator does. The numeric bounds
              // (aria-valuemin / aria-valuemax) have no Flutter counterpart
              // outside sliders, so the reading is spelled out in the value text
              // instead of being left implicit.
              label: '${bar.label} as a percentage of the contract',
              value: description,
              child: Container(
                decoration: BoxDecoration(
                  color: _barColor(bar),
                  borderRadius: MarosShape.borderXs,
                ),
              ),
            ),
          ),
        ),
      );
    }

    if (bar.clipped) {
      // The cut edge of a bar that runs past a fixed axis: the track colour
      // bitten out of the bar, so "it goes off the chart" can never be read as
      // "it stops here". A negative bar is cut at the left end, everything else
      // at the right.
      layers.add(
        Positioned(
          left: bar.negative ? 0.0 : null,
          right: bar.negative ? null : 0.0,
          top: 0.0,
          width: 4.0, // w-1
          height: barHeight,
          child: const IgnorePointer(
            child: ExcludeSemantics(
              child: CustomPaint(painter: _ClipEdgePainter()),
            ),
          ),
        ),
      );
    }

    return ClipRRect(
      borderRadius: MarosShape.borderXs, // --shape-xs
      child: SizedBox(
        width: width,
        height: barHeight,
        child: Stack(children: layers),
      ),
    );
  }

  /// The printed legend.
  ///
  /// Every amount carries its LABEL as text. The colour alone never says which
  /// lane a bar is — not to a colour-blind reader, not in a screenshot, not in
  /// print — so identity never depends on it.
  Widget _buildLegend(MoneyLineGeometry geometry) {
    return Wrap(
      spacing: 8.0, // gap-x-2
      runSpacing: 2.0,
      children: <Widget>[
        for (final MoneyLineBarGeometry bar in geometry.bars)
          Tooltip(
            message: _barDescription(bar),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                ExcludeSemantics(
                  child: Container(
                    width: 6.0, // size-1.5
                    height: 6.0,
                    decoration: BoxDecoration(
                      color: _barColor(bar),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                const SizedBox(width: 4.0), // gap-1
                Text(bar.label, style: MarosTypography.legendLabel),
                const SizedBox(width: 4.0),
                Text(
                  bar.value == null ? '—' : formatCurrency(bar.value),
                  style: bar.value == null
                      ? MarosTypography.legendFigureMissing
                      : MarosTypography.legendFigure,
                ),
              ],
            ),
          ),
      ],
    );
  }

  /// Percent of the axis to logical pixels, for the 1px rules and the hatch.
  ///
  /// Clamped to the last drawable pixel so a marker at exactly 100% of the axis
  /// (a fixed axis pinned at 100, say) still lands inside the clipped Stack
  /// instead of being cut away entirely.
  static double _px(double percent, double width) {
    final double x = width * percent / 100.0;
    final double last = width - 1.0 < 0.0 ? 0.0 : width - 1.0;
    if (x < 0.0) return 0.0;
    if (x > last) return last;
    return x;
  }

  /// The colour of a bar.
  ///
  /// A negative lane is money lost whatever it is. Past the contract is only
  /// alarming when the money is going OUT: collecting or holding more than the
  /// contract is good news (change orders, released retainage), and the contract
  /// marker already shows it.
  static Color _barColor(MoneyLineBarGeometry bar) {
    if (bar.negative ||
        (bar.overContract && bar.kind == MoneyLineBarKind.cashOut)) {
      return MarosMoneyColors.over;
    }
    // Written as plain comparisons instead of a switch so the function has one
    // obvious exit for every kind, with no dependence on how strictly the
    // analyzer in use treats switch exhaustiveness.
    if (bar.kind == MoneyLineBarKind.cashIn) return MarosMoneyColors.cashIn;
    if (bar.kind == MoneyLineBarKind.cashOut) return MarosMoneyColors.cashOut;
    return MarosMoneyColors.hold;
  }

  /// The text behind the tooltip and the semantics value — port of `barTitle`.
  static String _barDescription(MoneyLineBarGeometry bar) {
    if (bar.value == null) return '${bar.label}: no data';
    final String amount = formatCurrency(bar.value);
    final double? percent = bar.percentOfContract;
    if (percent == null) return '${bar.label}: $amount · no contract amount';
    final String share =
        '${bar.label}: $amount · ${formatPercentOfContract(percent)} of contract';
    return bar.clipped ? '$share · runs off the end of the axis' : share;
  }
}

/// The out-of-contract zone: 45° stripes of `--money-over` at 24% over nothing.
///
/// Port of the web's
/// `repeating-linear-gradient(45deg, color-mix(in srgb, var(--money-over) 24%,
/// transparent) 0 3px, transparent 3px 6px)`.
class _OverrunHatchPainter extends CustomPainter {
  const _OverrunHatchPainter();

  /// 24% of #FF8A7A. 0.24 * 255 = 61.2 -> 61 = 0x3D.
  static const Color _stripe = Color(0x3DFF8A7A);

  /// A CSS gradient measures its stops along the gradient axis, which for a 45°
  /// line is the diagonal. A 6px period along that diagonal is a 6 * sqrt(2)
  /// = 8.4853px step across the x axis. sqrt(2) is written out rather than
  /// imported from dart:math to keep this package on dart:core + Flutter only.
  static const double _xStep = 8.4853;

  @override
  void paint(Canvas canvas, Size size) {
    if (size.width <= 0.0 || size.height <= 0.0) return;
    // Without this the strokes would run past the left edge of this box and hatch
    // the bar to the left of the contract marker.
    canvas.clipRect(Rect.fromLTWH(0.0, 0.0, size.width, size.height));

    final Paint paint = Paint()
      ..color = _stripe
      // Thickness is measured perpendicular to the line, which is exactly the
      // gradient axis: a 3px stop is a 3px stroke.
      ..strokeWidth = 3.0
      ..style = PaintingStyle.stroke;

    // 45deg in CSS puts the gradient axis towards the top right, so the bands of
    // constant colour run top-left to bottom-right: "\".
    final double h = size.height;
    for (double x = -h; x < size.width + h; x += _xStep) {
      canvas.drawLine(Offset(x, 0.0), Offset(x + h, h), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// The cut edge of a clipped bar: 1px stripes of the track colour every 3px,
/// bitten out of the bar at the axis end.
///
/// Port of the web's
/// `repeating-linear-gradient(-45deg, var(--money-track) 0 1px, transparent
/// 1px 3px)`.
class _ClipEdgePainter extends CustomPainter {
  const _ClipEdgePainter();

  /// 3px along the -45° axis = 3 * sqrt(2) = 4.2426px across x.
  static const double _xStep = 4.2426;

  @override
  void paint(Canvas canvas, Size size) {
    if (size.width <= 0.0 || size.height <= 0.0) return;
    canvas.clipRect(Rect.fromLTWH(0.0, 0.0, size.width, size.height));

    final Paint paint = Paint()
      ..color = MarosMoneyColors.track
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    // -45deg mirrors the hatch: the bands run bottom-left to top-right, "/".
    final double h = size.height;
    for (double x = 0.0; x < size.width + h; x += _xStep) {
      canvas.drawLine(Offset(x, 0.0), Offset(x - h, h), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
