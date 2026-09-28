/// Money formatting, ported from `maros-next/src/shared/utils/formatCurrency.ts`.
///
/// The web calls `Number.toLocaleString("en-US", { minimumFractionDigits: d,
/// maximumFractionDigits: d })` and prefixes a `$`. Flutter's equivalent lives in
/// `package:intl`, which this package deliberately does not depend on, so the
/// grouping is done by hand below. It is the whole of the en-US rule that matters
/// here: a comma every three digits, always `d` decimals.
library;

/// Formats [amount] the way the web does: `$1,234.50`.
///
/// Returns `"-"` when there is no amount, exactly like the TypeScript (which
/// returns `"-"` for null, undefined and NaN). The TS also accepts a string and
/// parses it; that overload is not ported, because nothing in this package has a
/// money amount in a string.
///
/// Note the sign placement is INHERITED, not chosen: the TS builds the output as
/// `"$" + number.toLocaleString(...)`, so a negative amount reads `$-40,000.00`,
/// not `-$40,000.00`. It is reproduced here so a Flutter screen and the web page
/// print the same characters for the same row.
String formatCurrency(double? amount, {int decimals = 2}) {
  if (amount == null) return '-';
  // JS: isNaN(numAmount) -> "-". Infinity is not NaN in JS and would print as
  // "$∞"; a non-finite money amount is a data error either way, so both are
  // reported as "no value" here rather than rendering a symbol nobody expects.
  if (!amount.isFinite) return '-';

  // The sign is taken from the input, not from the rounded text: -0.004 at two
  // decimals prints "-0.00" in en-US, and dropping the sign there would turn a
  // (tiny) loss into a (tiny) gain.
  final bool isNegative = amount < 0;
  final String fixed = amount.abs().toStringAsFixed(decimals);

  final int dot = fixed.indexOf('.');
  final String whole = dot == -1 ? fixed : fixed.substring(0, dot);
  final String fraction = dot == -1 ? '' : fixed.substring(dot);

  final StringBuffer grouped = StringBuffer();
  for (int i = 0; i < whole.length; i++) {
    // A comma goes before every digit whose distance to the end is a multiple of
    // three, except at the very start of the number.
    final int fromEnd = whole.length - i;
    if (i > 0 && fromEnd % 3 == 0) grouped.write(',');
    grouped.write(whole[i]);
  }

  return '\$' + (isNegative ? '-' : '') + grouped.toString() + fraction;
}
