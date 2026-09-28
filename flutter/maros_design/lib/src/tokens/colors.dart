import 'package:flutter/material.dart' show Color;

/// Colour tokens — contract Rev. E.
///
/// Every value below is the HEX from `maros-next/src/styles/globals.css` `:root`.
/// That sheet declares most tokens twice: an `--x-hsl` channel triplet (because
/// shadcn reads them as `hsl(var(--x))`) and the colour itself. What is ported
/// here is the COLOUR, and each token names the CSS custom property it came
/// from, so a reviewer can diff the two files line by line.
///
/// ---------------------------------------------------------------------------
/// THE ONE RULE THIS FILE EXISTS TO ENFORCE
/// ---------------------------------------------------------------------------
/// The mint family is INTERFACE: navigation, focus rings, the primary button.
/// It never appears inside a piece of data.
/// The `money*` family is DATA: the money line and the status badges only. It
/// never paints chrome.
/// Mixing the two makes "this is a control" and "this is a number" read the
/// same, which is why the CSS says so in a comment and why the two families are
/// separated into different classes here instead of one flat palette.
/// ---------------------------------------------------------------------------
class MarosColors {
  const MarosColors._();

  // --- Elevation: opaque tonal surfaces, app background upwards. -------------
  // These are surfaces, not shadows and not stacked opacities. See
  // MarosElevation in elevation.dart for the ramp and the reason.

  /// `--elev-0` / `#0E1211` — app background.
  static const Color elev0 = Color(0xFF0E1211);

  /// `--elev-1` / `#141917` — base panel.
  static const Color elev1 = Color(0xFF141917);

  /// `--elev-2` / `#191F1D` — card, row.
  static const Color elev2 = Color(0xFF191F1D);

  /// `--elev-3` / `#1D2422` — sidebar, hover.
  static const Color elev3 = Color(0xFF1D2422);

  /// `--elev-4` / `#222A27` — menu, chip.
  static const Color elev4 = Color(0xFF222A27);

  /// `--elev-5` / `#27302C` — dialog.
  static const Color elev5 = Color(0xFF27302C);

  // --- Lines ----------------------------------------------------------------

  /// `--line` / `#38433F` — ordinary separators and card borders.
  static const Color line = Color(0xFF38433F);

  /// `--line-strong` / `#707976` — borders of interactive controls. Also the
  /// money line's contract marker and zero gridline: those two are structure
  /// (an axis), not data, so they are allowed to use a line token.
  static const Color lineStrong = Color(0xFF707976);

  // --- Foreground -----------------------------------------------------------

  /// `--fg` / `#E4E8E6` — primary text.
  static const Color fg = Color(0xFFE4E8E6);

  /// `--fg-dim` / `#A6AEAB` — secondary text, figures in a legend.
  static const Color fgDim = Color(0xFFA6AEAB);

  /// `--fg-faint` / `#8F9793` — labels, captions, "no data".
  static const Color fgFaint = Color(0xFF8F9793);

  // --- INTERFACE (mint). Chrome only: navigation, focus, primary button. -----
  // Never inside a piece of data — use MarosMoneyColors for that.

  /// `--primary-mint` / `#5FE3C4`.
  static const Color primaryMint = Color(0xFF5FE3C4);

  /// `--on-primary` / `#00352A` — content on top of [primaryMint].
  static const Color onPrimary = Color(0xFF00352A);

  /// `--primary-container` / `#12433A`.
  static const Color primaryContainer = Color(0xFF12433A);

  /// `--on-primary-container` / `#8CFFE2`.
  static const Color onPrimaryContainer = Color(0xFF8CFFE2);

  // --- Outside the contract, carried over as-is. ----------------------------

  /// `--destructive` / `hsl(0 62% 46%)` → `#BE2D2D`. Converted from the channel
  /// form because globals.css gives no hex twin for it.
  static const Color destructive = Color(0xFFBE2D2D);

  /// `--destructive-foreground` / `hsl(60 9% 93%)` → `#EFEFEC`.
  static const Color onDestructive = Color(0xFFEFEFEC);
}

/// DATA colours — `--money-*` in globals.css.
///
/// These belong to the money line and the status badges and to nothing else.
/// They are in their own class so that reaching for a money colour to paint a
/// button is a visible mistake at the call site (`MarosMoneyColors.cashIn` on a
/// `FilledButton` reads wrong) rather than an invisible one.
class MarosMoneyColors {
  const MarosMoneyColors._();

  /// `--money-in` / `#4ED0A0` — collected.
  ///
  /// Note it is NOT `--primary-mint`: they are close on purpose (one family,
  /// one brand) but distinct, so a collected-cash bar is never mistaken for a
  /// control and never inherits a focus/hover treatment.
  static const Color cashIn = Color(0xFF4ED0A0);

  /// `--money-out` / `#E0A84F` — spent.
  static const Color cashOut = Color(0xFFE0A84F);

  /// `--money-hold` / `#8E96D8` — backlog, contracted but not executed.
  static const Color hold = Color(0xFF8E96D8);

  /// `--money-over` / `#FF8A7A` — out of contract, or a loss.
  static const Color over = Color(0xFFFF8A7A);

  /// `--money-track` / `#242D2A` — the empty track of a bar.
  static const Color track = Color(0xFF242D2A);
}
