import 'package:flutter/material.dart';

import 'tokens/colors.dart';
import 'tokens/elevation.dart';
import 'tokens/shape.dart';
import 'tokens/typography.dart';

/// The MARO [ThemeData], built from the tokens and from nothing else.
///
/// Dark is the base palette, not a variant: globals.css declares it in `:root`
/// and the app renders dark with or without a theme class. There is therefore
/// one theme here, and it is dark. A light theme is not "missing" — it does not
/// exist in the contract, and inventing one would put values in the Flutter app
/// that no designer ever approved.
///
/// ---------------------------------------------------------------------------
/// ELEVATION IS A SURFACE, NOT A SHADOW
/// ---------------------------------------------------------------------------
/// Material 3 in Flutter expresses depth two ways this theme refuses:
///   1. `shadowColor` — a drop shadow under the component;
///   2. `surfaceTintColor` — an ALPHA tint of the primary colour painted over
///      the surface, growing with `elevation`.
/// Both are neutralised below (transparent), because the contract's depth model
/// is the opaque [MarosElevation] ramp. Layering translucency is precisely what
/// the web had to undo: washes over an `elev-2` row composited down to a ~1.03:1
/// step, i.e. no readable boundary. To raise a surface here, paint it with the
/// next rung of the ramp.
///
/// The mint is INTERFACE (`colorScheme.primary`: focus ring, primary button,
/// selected navigation). The `--money-*` tokens are DATA and appear nowhere in
/// this theme on purpose — no widget should be able to pick one up by accident
/// from `Theme.of(context)`. See [MarosMoneyColors].
class MarosTheme {
  const MarosTheme._();

  /// The dark colour scheme.
  ///
  /// Built with `ColorScheme.dark(...)` rather than the unnamed `ColorScheme(...)`
  /// constructor because the latter's list of REQUIRED arguments has changed
  /// between Flutter releases (`background`/`onBackground` came and went); every
  /// argument of `ColorScheme.dark` is optional, so this call keeps compiling.
  /// For the same reason the newer `surfaceContainer*` roles are left alone.
  static const ColorScheme colorScheme = ColorScheme.dark(
    // --- Interface mint ---
    primary: MarosColors.primaryMint, // --primary / --primary-mint
    onPrimary: MarosColors.onPrimary, // --primary-foreground / --on-primary
    primaryContainer: MarosColors.primaryContainer, // --primary-container
    onPrimaryContainer: MarosColors.onPrimaryContainer, // --on-primary-container

    // --- Secondary: the web maps --secondary onto elev-2, i.e. a surface, with
    // ordinary foreground text on it. Not a second accent hue.
    secondary: MarosColors.elev2,
    onSecondary: MarosColors.fg,
    secondaryContainer: MarosColors.elev4, // --muted
    onSecondaryContainer: MarosColors.fgDim, // --muted-foreground

    // --- Surfaces ---
    // `surface` is the card/row rung (elev-2, the web's --card/--popover), which
    // is what most Material components paint themselves with. The window
    // background is elev-0 and is set separately as scaffoldBackgroundColor,
    // because the deprecated `background` role is not safe to pass any more.
    surface: MarosColors.elev2,
    onSurface: MarosColors.fg, // --card-foreground
    onSurfaceVariant: MarosColors.fgDim, // --muted-foreground
    outline: MarosColors.line, // --border / --line

    // --- Outside the contract, carried over from globals.css as-is ---
    error: MarosColors.destructive,
    onError: MarosColors.onDestructive,

    // Depth comes from the ramp, so there is nothing to tint or to cast.
    surfaceTint: Color(0x00000000),
    shadow: Color(0x00000000),
  );

  /// The theme itself.
  ///
  /// Only long-stable [ThemeData] fields are set. `cardTheme` and `dialogTheme`
  /// are deliberately NOT set: their parameter types were renamed
  /// (`CardTheme` -> `CardThemeData`, `DialogTheme` -> `DialogThemeData`) in a
  /// recent Flutter release, so hard-coding either one would make this package
  /// fail to compile on one side of that line. Cards and dialogs should be
  /// painted with `MarosElevation.level2` / `level5` and `MarosShape.md` / `lg`
  /// at the call site.
  static ThemeData dark() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colorScheme,

      // The app background: --elev-0.
      scaffoldBackgroundColor: MarosElevation.level0,
      canvasColor: MarosElevation.level0,

      // No shadows anywhere: see the class comment.
      shadowColor: const Color(0x00000000),

      dividerColor: MarosColors.line, // --border
      dividerTheme: const DividerThemeData(
        color: MarosColors.line,
        thickness: 1.0,
        space: 1.0,
      ),

      iconTheme: const IconThemeData(color: MarosColors.fgDim),
      primaryColor: MarosColors.primaryMint,

      // NOTE: `fontFamily` is intentionally left unset. ThemeData applies it by
      // rewriting every style in the text theme, which would replace Archivo on
      // the display roles with the body face. The families live in the styles.
      textTheme: MarosTypography.textTheme(),

      appBarTheme: const AppBarTheme(
        // A top bar reads as chrome one rung above the panel behind it.
        backgroundColor: MarosElevation.level1,
        foregroundColor: MarosColors.fg,
        elevation: 0.0,
        // Without this, Material 3 tints the bar when content scrolls under it —
        // a stacked translucency by another name.
        scrolledUnderElevation: 0.0,
        surfaceTintColor: Color(0x00000000),
      ),

      // The card/row rung, for the legacy (Material 2) consumers that still read
      // `Theme.of(context).cardColor` instead of the colour scheme.
      cardColor: MarosElevation.level2,
    );
  }

  /// The corner radius a panel should use, exposed here so a screen does not
  /// have to import the shape tokens just to round a container.
  static const double panelRadius = MarosShape.md;
}
