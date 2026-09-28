/// maros_design — the MARO design system (contract Rev. E) in Flutter.
///
/// Ported from the `maros-next` web app. The public API is deliberately small:
/// tokens, one theme, one widget and the arithmetic behind it. Anything under
/// `lib/src/` that is not exported here is an implementation detail.
///
/// The one rule the whole package is built around: the MINT family is interface
/// (navigation, focus, primary button) and the MONEY family is data (the money
/// line and the status badges). See `lib/src/tokens/colors.dart`.
library maros_design;

// --- Tokens ----------------------------------------------------------------
export 'src/tokens/colors.dart' show MarosColors, MarosMoneyColors;
export 'src/tokens/elevation.dart' show MarosElevation;
export 'src/tokens/shape.dart' show MarosShape;
export 'src/tokens/typography.dart' show MarosTypography;

// --- Theme -----------------------------------------------------------------
export 'src/theme.dart' show MarosTheme;

// --- Money line ------------------------------------------------------------
// The geometry is exported as well as the widget: the numbers are the contract
// with the web, and a caller may legitimately want the arithmetic without the
// picture (a table cell that prints the percentage, a test).
export 'src/money_line_geometry.dart'
    show
        MoneyLineBarGeometry,
        MoneyLineBarInput,
        MoneyLineBarKind,
        MoneyLineGeometry,
        MoneyLineGeometryOptions,
        computeMoneyLineGeometry,
        formatPercentOfContract,
        kListAxisMaxPercent,
        kMinClippedLengthPercent;
export 'src/widgets/money_line.dart' show MoneyLine, MoneyValue;

// --- Formatting ------------------------------------------------------------
export 'src/format/currency.dart' show formatCurrency;
