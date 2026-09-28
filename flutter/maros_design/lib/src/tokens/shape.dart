import 'package:flutter/material.dart' show BorderRadius, Radius;

/// Shape scale — `--shape-xs/sm/md/lg` in globals.css, in logical pixels.
///
/// The CSS names them `--shape-*` and not `--radius-*` on purpose: Tailwind v4
/// owns the `--radius-*` namespace, and reusing those names produced two
/// declarations of each with different values in the compiled sheet. Keeping the
/// same names here keeps the two systems greppable against each other.
class MarosShape {
  const MarosShape._();

  /// `--shape-xs: 4px` — money-line bars and other small data marks.
  static const double xs = 4.0;

  /// `--shape-sm: 8px` — the base. globals.css sets `--radius: var(--shape-sm)`,
  /// and Tailwind derives `rounded-sm/md/lg` from it.
  static const double sm = 8.0;

  /// `--shape-md: 12px` — cards, panels.
  static const double md = 12.0;

  /// `--shape-lg: 16px` — dialogs, large containers.
  static const double lg = 16.0;

  /// The Tailwind-derived scale, reproduced so a ported component keeps the same
  /// corner it had on the web:
  ///   `rounded-lg` = `var(--radius)`        = 8px
  ///   `rounded-md` = `calc(var(--radius) - 2px)` = 6px
  ///   `rounded-sm` = `calc(var(--radius) - 4px)` = 4px
  static const double roundedLg = sm; // 8
  static const double roundedMd = sm - 2.0; // 6
  static const double roundedSm = sm - 4.0; // 4

  static const BorderRadius borderXs = BorderRadius.all(Radius.circular(xs));
  static const BorderRadius borderSm = BorderRadius.all(Radius.circular(sm));
  static const BorderRadius borderMd = BorderRadius.all(Radius.circular(md));
  static const BorderRadius borderLg = BorderRadius.all(Radius.circular(lg));
}
