// Port of
// maros-next/src/features/project/presentation/molecules/moneyLineGeometry.test.ts
//
// Case by case, with the same numbers. Vitest's `toMatchObject` has no
// flutter_test equivalent, so each object assertion becomes one `expect` per
// field — the same fields, in the same order as the original.
//
// NOT RUN: the machine this was written on has no Flutter SDK. Run it with
//   flutter pub get && flutter test
// See README.md.

import 'package:flutter_test/flutter_test.dart';
import 'package:maros_design/maros_design.dart';

const double contract = 100000.0;

/// Mirrors the TS helper `bars(...)`: label/value pairs, all in the "in" lane,
/// because these tests are about arithmetic and not about colour.
///
/// A Map literal is used for the pairs because Dart preserves insertion order and
/// every case here uses distinct labels.
List<MoneyLineBarInput> bars(Map<String, double?> values) {
  final List<MoneyLineBarInput> result = <MoneyLineBarInput>[];
  values.forEach((String label, double? value) {
    result.add(
      MoneyLineBarInput(
        label: label,
        value: value,
        kind: MoneyLineBarKind.cashIn,
      ),
    );
  });
  return result;
}

void main() {
  group('computeMoneyLineGeometry', () {
    test('scales each bar against the contract, leaving headroom past the '
        'contract edge', () {
      final MoneyLineGeometry geometry = computeMoneyLineGeometry(
        contract,
        bars(<String, double?>{'Collected': 50000.0, 'Spent': 25000.0}),
      );

      expect(geometry.hasContract, isTrue);
      expect(geometry.zeroPercent, 0.0);
      expect(geometry.contractPercent, 80.0);

      final MoneyLineBarGeometry collected = geometry.bars[0];
      expect(collected.percentOfContract, 50.0);
      expect(collected.offsetPercent, 0.0);
      expect(collected.lengthPercent, 40.0);
      expect(collected.negative, isFalse);
      expect(collected.overContract, isFalse);

      expect(geometry.bars[1].percentOfContract, 25.0);
      expect(geometry.bars[1].lengthPercent, 20.0);
    });

    test('draws a bar above the contract longer than one exactly at the '
        'contract', () {
      final MoneyLineGeometry geometry = computeMoneyLineGeometry(
        contract,
        bars(<String, double?>{'At contract': 100000.0, 'Over': 128000.0}),
      );

      final MoneyLineBarGeometry atContract = geometry.bars[0];
      final MoneyLineBarGeometry over = geometry.bars[1];

      expect(over.percentOfContract, 128.0);
      expect(over.overContract, isTrue);
      expect(atContract.overContract, isFalse);
      // The bug this replaces clamped both to 100% and drew them identically.
      expect(over.lengthPercent, greaterThan(atContract.lengthPercent));
      // The axis stretched to hold the overrun, so the contract edge moved left
      // of 80%.
      expect(geometry.axisMaxPercent, 128.0);
      // vitest's toBeCloseTo(78.125, 3) is |diff| < 0.0005.
      expect(geometry.contractPercent, closeTo(78.125, 0.0005));
      expect(over.lengthPercent, 100.0);
    });

    test('puts a negative value left of zero instead of mirroring the positive '
        'one', () {
      final MoneyLineGeometry geometry = computeMoneyLineGeometry(
        contract,
        bars(<String, double?>{'Loss': -40000.0, 'Profit': 40000.0}),
      );

      final MoneyLineBarGeometry loss = geometry.bars[0];
      final MoneyLineBarGeometry profit = geometry.bars[1];

      expect(geometry.axisMinPercent, -40.0);
      // toBeCloseTo(24.24, 2) is |diff| < 0.005; the exact value is 24.242.
      expect(geometry.zeroPercent, closeTo(24.24, 0.005));

      expect(loss.percentOfContract, -40.0);
      expect(loss.offsetPercent, 0.0);
      expect(loss.negative, isTrue);

      expect(profit.percentOfContract, 40.0);
      expect(profit.negative, isFalse);
      expect(profit.offsetPercent, geometry.zeroPercent);

      // Same magnitude, opposite sides of zero: they can no longer be confused.
      expect(loss.offsetPercent, isNot(profit.offsetPercent));
    });

    test('leaves the track empty when there is no usable contract', () {
      // The TS loops over [null, undefined, 0, -5_000]. Dart has a single empty
      // value, so `undefined` collapses into `null` and the loop is three cases.
      for (final double? estimate in <double?>[null, 0.0, -5000.0]) {
        final MoneyLineGeometry geometry = computeMoneyLineGeometry(
          estimate,
          bars(<String, double?>{'Collected': 50000.0}),
        );

        expect(geometry.hasContract, isFalse, reason: 'estimate = $estimate');
        expect(geometry.bars[0].value, 50000.0, reason: 'estimate = $estimate');
        expect(
          geometry.bars[0].percentOfContract,
          isNull,
          reason: 'estimate = $estimate',
        );
        expect(
          geometry.bars[0].lengthPercent,
          0.0,
          reason: 'estimate = $estimate',
        );
      }
    });

    test('tells a missing value apart from zero', () {
      final MoneyLineGeometry geometry = computeMoneyLineGeometry(
        contract,
        bars(<String, double?>{'Missing': null, 'Zero': 0.0}),
      );

      final MoneyLineBarGeometry missing = geometry.bars[0];
      final MoneyLineBarGeometry zero = geometry.bars[1];

      expect(missing.percentOfContract, isNull);
      expect(zero.percentOfContract, 0.0);
      expect(missing.lengthPercent, 0.0);
      expect(zero.lengthPercent, 0.0);
      expect(zero.negative, isFalse);
    });

    test('keeps a missing value from shrinking the axis the other bars share',
        () {
      final MoneyLineGeometry geometry = computeMoneyLineGeometry(
        contract,
        bars(<String, double?>{'Collected': null, 'Spent': 200000.0}),
      );

      expect(geometry.axisMaxPercent, 200.0);
      expect(geometry.contractPercent, 50.0);
      expect(geometry.bars[1].lengthPercent, 100.0);
    });
  });

  group('computeMoneyLineGeometry with a fixed axis', () {
    test('keeps the contract edge on the same x whatever the data', () {
      final MoneyLineGeometry small = computeMoneyLineGeometry(
        50000.0,
        bars(<String, double?>{'Collected': 5000.0}),
        const MoneyLineGeometryOptions(axisMaxPercent: kListAxisMaxPercent),
      );
      final MoneyLineGeometry huge = computeMoneyLineGeometry(
        900000.0,
        bars(<String, double?>{'Collected': 3000000.0}),
        const MoneyLineGeometryOptions(axisMaxPercent: kListAxisMaxPercent),
      );

      expect(small.contractPercent, huge.contractPercent);
      expect(small.axisMaxPercent, kListAxisMaxPercent);
      expect(huge.axisMaxPercent, kListAxisMaxPercent);
    });

    test('clips a bar past the axis and still reports its true share', () {
      final MoneyLineGeometry geometry = computeMoneyLineGeometry(
        100000.0,
        bars(<String, double?>{'Over': 400000.0, 'Fits': 50000.0}),
        const MoneyLineGeometryOptions(axisMaxPercent: kListAxisMaxPercent),
      );

      final MoneyLineBarGeometry over = geometry.bars[0];
      final MoneyLineBarGeometry fits = geometry.bars[1];

      expect(over.percentOfContract, 400.0);
      expect(over.lengthPercent, 100.0);
      expect(over.clipped, isTrue);
      expect(fits.clipped, isFalse);
    });

    test('does not clip anything on the elastic axis', () {
      final MoneyLineGeometry geometry = computeMoneyLineGeometry(
        contract,
        bars(<String, double?>{'Over': 400000.0}),
      );

      expect(geometry.axisMaxPercent, 400.0);
      expect(geometry.bars[0].clipped, isFalse);
    });
  });

  // ---------------------------------------------------------------------------
  // Beyond the port: two properties the TypeScript asserts in comments only.
  // They are listed in the brief as reasons this file exists, so they get a test
  // rather than a promise.
  // ---------------------------------------------------------------------------
  group('computeMoneyLineGeometry, properties the TS tests left implicit', () {
    test('keeps a visible sliver for a bar clipped to nothing', () {
      // A fixed axis starts at 0, so a negative bar is clipped to zero length.
      // Without the sliver it would render as a zero-width box: invisible, and
      // with no tooltip to hover, i.e. the silent clip at the other end.
      final MoneyLineGeometry geometry = computeMoneyLineGeometry(
        contract,
        bars(<String, double?>{'Loss': -50000.0}),
        const MoneyLineGeometryOptions(axisMaxPercent: kListAxisMaxPercent),
      );

      final MoneyLineBarGeometry loss = geometry.bars[0];
      expect(loss.clipped, isTrue);
      expect(loss.negative, isTrue);
      expect(loss.lengthPercent, kMinClippedLengthPercent);
      // The drawn bar is a sliver; the reported share is still the real one.
      expect(loss.percentOfContract, -50.0);
    });

    test('formatPercentOfContract keeps a decimal below 1%', () {
      expect(formatPercentOfContract(0.4), '0.4%');
      expect(formatPercentOfContract(-0.4), '-0.4%');
      expect(formatPercentOfContract(12.4), '12%');
      expect(formatPercentOfContract(128.0), '128%');
      expect(formatPercentOfContract(-40.0), '-40%');
    });
  });
}
