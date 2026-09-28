import 'package:flutter/material.dart' show FontWeight, TextStyle, TextTheme;

import 'colors.dart';

/// Typography tokens.
///
/// Three families, exactly the three the web loads in
/// `maros-next/src/app/layout.tsx` and exposes through `tailwind.config.ts` as
/// `font-display`, `font-sans` and `font-mono`:
///
///   * [display] — Archivo. Headings and figures that act as headings.
///   * [sans]    — IBM Plex Sans. Body copy, labels, everything by default.
///   * [mono]    — IBM Plex Mono. FIGURES. layout.tsx spells it out: "Figures
///                 belong in the mono face." A money column only lines up if
///                 every digit has the same width.
///
/// ---------------------------------------------------------------------------
/// READ THIS BEFORE TRUSTING A SCREENSHOT
/// ---------------------------------------------------------------------------
/// The font FILES are not in this package (see pubspec.yaml). Flutter resolves
/// an unknown `fontFamily` by silently falling back to the platform font: no
/// error, no warning, and figures lose their tabular alignment. The web shipped
/// that exact bug and fixed it; this comment exists so the port does not repeat
/// it quietly.
class MarosTypography {
  const MarosTypography._();

  /// `--font-display` / Tailwind `font-display`.
  static const String display = 'Archivo';

  /// `--font-sans` / Tailwind `font-sans`. The default family of the theme.
  static const String sans = 'IBM Plex Sans';

  /// `--font-mono` / Tailwind `font-mono`. layout.tsx loads weights 400 and 500
  /// for this family and no others, so nothing here asks for a bolder mono.
  static const String mono = 'IBM Plex Mono';

  /// Fallbacks that mirror `tailwind.config.ts`:
  ///   display/sans -> "system-ui", "sans-serif"
  ///   mono         -> "ui-monospace", "monospace"
  /// Flutter cannot name the generic families, so these are concrete faces that
  /// exist on the desktop and mobile targets MARO runs on.
  static const List<String> sansFallback = <String>['Roboto', 'Segoe UI', 'Arial'];
  static const List<String> monoFallback = <String>[
    'Roboto Mono',
    'Consolas',
    'Courier New',
  ];

  /// A figure: mono face, medium weight, dim foreground.
  ///
  /// Deliberately does NOT set `fontFeatures: [FontFeature.tabularFigures()]`.
  /// `FontFeature` lives in `dart:ui`, which this package does not import (see
  /// README), and IBM Plex Mono is monospaced anyway, so every digit is already
  /// the same width. If the mono file is missing, the *fallback* may not be —
  /// which is the whole point of the warning above.
  static const TextStyle figure = TextStyle(
    fontFamily: mono,
    fontFamilyFallback: monoFallback,
    fontWeight: FontWeight.w500,
    color: MarosColors.fgDim,
  );

  /// The money-line legend: `text-[10px] leading-3` in MoneyLine.tsx, i.e. a
  /// 10px face on a 12px line, which is a height factor of 1.2.
  static const TextStyle legendLabel = TextStyle(
    fontFamily: sans,
    fontFamilyFallback: sansFallback,
    fontSize: 10.0,
    height: 1.2,
    color: MarosColors.fgFaint,
  );

  /// The legend's amount: same metrics as [legendLabel], mono face.
  static const TextStyle legendFigure = TextStyle(
    fontFamily: mono,
    fontFamilyFallback: monoFallback,
    fontSize: 10.0,
    height: 1.2,
    fontWeight: FontWeight.w500,
    color: MarosColors.fgDim,
  );

  /// The legend's amount when there is no value at all: same metrics, faint.
  static const TextStyle legendFigureMissing = TextStyle(
    fontFamily: mono,
    fontFamilyFallback: monoFallback,
    fontSize: 10.0,
    height: 1.2,
    fontWeight: FontWeight.w500,
    color: MarosColors.fgFaint,
  );

  /// The text theme handed to [ThemeData].
  ///
  /// Only the families, weights and colours are set here; the SIZES are
  /// Material 3's defaults on purpose. The web's sizes come from Tailwind's
  /// scale applied per component, so there is no authoritative per-role size in
  /// globals.css to port — inventing one would be a value that exists in neither
  /// system.
  static TextTheme textTheme() {
    const TextStyle displayFace = TextStyle(
      fontFamily: display,
      fontFamilyFallback: sansFallback,
      color: MarosColors.fg,
    );
    const TextStyle bodyFace = TextStyle(
      fontFamily: sans,
      fontFamilyFallback: sansFallback,
      color: MarosColors.fg,
    );
    const TextStyle mutedBodyFace = TextStyle(
      fontFamily: sans,
      fontFamilyFallback: sansFallback,
      color: MarosColors.fgDim,
    );

    return const TextTheme(
      // Display and headline roles are the Archivo face.
      displayLarge: displayFace,
      displayMedium: displayFace,
      displaySmall: displayFace,
      headlineLarge: displayFace,
      headlineMedium: displayFace,
      headlineSmall: displayFace,
      // A title is still chrome-ish but sits inside dense UI: body face, so a
      // card header does not shout.
      titleLarge: displayFace,
      titleMedium: bodyFace,
      titleSmall: bodyFace,
      bodyLarge: bodyFace,
      bodyMedium: bodyFace,
      // The smallest body text is secondary by definition.
      bodySmall: mutedBodyFace,
      labelLarge: bodyFace,
      labelMedium: bodyFace,
      labelSmall: mutedBodyFace,
    );
  }
}
