import 'package:flutter/material.dart' show Color;

import 'colors.dart';

/// The elevation ramp — `--elev-0` .. `--elev-5` in globals.css.
///
/// ---------------------------------------------------------------------------
/// THESE ARE OPAQUE SURFACES. NOT SHADOWS. NOT STACKED OPACITIES.
/// ---------------------------------------------------------------------------
/// globals.css says it in one line: "Elevation — opaque tonal surfaces, from the
/// app background upwards. Stack these instead of layering opacities
/// (bg-card/40) so nothing shows through."
///
/// The web arrived here after the opposite approach failed: translucent washes
/// (`bg-muted/50` over an `elev-2` row, `hover:bg-accent/30`) composited down to
/// a ~1.03:1 step between a surface and the thing supposedly sitting on top of
/// it, i.e. no visible step at all, plus whatever happened to be underneath
/// bleeding through. Material 3's default answer in Flutter is the same trap in
/// a different costume: `elevation: 4` paints a shadow and, with
/// `surfaceTintColor`, an ALPHA tint over the surface.
///
/// So in this package:
///   * "raising" a surface means picking the next rung of this ramp;
///   * Material `elevation` stays 0 and `shadowColor` / `surfaceTintColor` are
///     neutralised in [MarosTheme];
///   * nothing is ever drawn with a fractional opacity to fake depth.
class MarosElevation {
  const MarosElevation._();

  /// Level 0 — the app background. `--elev-0`.
  static const Color level0 = MarosColors.elev0;

  /// Level 1 — base panel. `--elev-1`.
  static const Color level1 = MarosColors.elev1;

  /// Level 2 — card, table row. `--elev-2`.
  static const Color level2 = MarosColors.elev2;

  /// Level 3 — sidebar, and the hover surface for a row sitting on level 2.
  /// `--elev-3`.
  static const Color level3 = MarosColors.elev3;

  /// Level 4 — menu, chip. `--elev-4`. This is what the web maps `--muted` to.
  static const Color level4 = MarosColors.elev4;

  /// Level 5 — dialog. `--elev-5`. This is what the web maps `--accent` to.
  static const Color level5 = MarosColors.elev5;

  /// The ramp in order, so a widget can walk it (`ramp[depth + 1]`) instead of
  /// inventing an in-between shade.
  static const List<Color> ramp = <Color>[
    level0,
    level1,
    level2,
    level3,
    level4,
    level5,
  ];

  /// The surface one rung above [level], clamped to the ends of the ramp.
  ///
  /// Clamps rather than extrapolating: there is no `--elev-6` in the contract,
  /// and guessing one is how a palette drifts.
  static Color above(int level) {
    final int next = level + 1;
    if (next <= 0) return ramp.first;
    if (next >= ramp.length) return ramp.last;
    return ramp[next];
  }
}
