import { describe, expect, it } from "vitest";

import {
  computeMoneyLineGeometry,
  LIST_AXIS_MAX_PERCENT,
  type MoneyLineBarInput,
} from "./moneyLineGeometry";

const CONTRACT = 100_000;

function bars(...values: Array<[string, number | null]>): MoneyLineBarInput[] {
  return values.map(([label, value]) => ({ label, value, kind: "in" as const }));
}

describe("computeMoneyLineGeometry", () => {
  it("scales each bar against the contract, leaving headroom past the contract edge", () => {
    const geometry = computeMoneyLineGeometry(CONTRACT, bars(["Collected", 50_000], ["Spent", 25_000]));

    expect(geometry.hasContract).toBe(true);
    expect(geometry.zeroPercent).toBe(0);
    expect(geometry.contractPercent).toBe(80);
    expect(geometry.bars[0]).toMatchObject({
      percentOfContract: 50,
      offsetPercent: 0,
      lengthPercent: 40,
      negative: false,
      overContract: false,
    });
    expect(geometry.bars[1]).toMatchObject({ percentOfContract: 25, lengthPercent: 20 });
  });

  it("draws a bar above the contract longer than one exactly at the contract", () => {
    const geometry = computeMoneyLineGeometry(CONTRACT, bars(["At contract", 100_000], ["Over", 128_000]));

    const [atContract, over] = geometry.bars;
    expect(over.percentOfContract).toBe(128);
    expect(over.overContract).toBe(true);
    expect(atContract.overContract).toBe(false);
    // The bug this replaces clamped both to 100% and drew them identically.
    expect(over.lengthPercent).toBeGreaterThan(atContract.lengthPercent);
    // The axis stretched to hold the overrun, so the contract edge moved left of 80%.
    expect(geometry.axisMaxPercent).toBe(128);
    expect(geometry.contractPercent).toBeCloseTo(78.125, 3);
    expect(over.lengthPercent).toBe(100);
  });

  it("puts a negative value left of zero instead of mirroring the positive one", () => {
    const geometry = computeMoneyLineGeometry(CONTRACT, bars(["Loss", -40_000], ["Profit", 40_000]));

    const [loss, profit] = geometry.bars;
    expect(geometry.axisMinPercent).toBe(-40);
    expect(geometry.zeroPercent).toBeCloseTo(24.24, 2);
    expect(loss).toMatchObject({ percentOfContract: -40, offsetPercent: 0, negative: true });
    expect(profit).toMatchObject({ percentOfContract: 40, negative: false });
    expect(profit.offsetPercent).toBe(geometry.zeroPercent);
    // Same magnitude, opposite sides of zero: they can no longer be confused.
    expect(loss.offsetPercent).not.toBe(profit.offsetPercent);
  });

  it("leaves the track empty when there is no usable contract", () => {
    for (const estimate of [null, undefined, 0, -5_000]) {
      const geometry = computeMoneyLineGeometry(estimate, bars(["Collected", 50_000]));

      expect(geometry.hasContract).toBe(false);
      expect(geometry.bars[0]).toMatchObject({
        value: 50_000,
        percentOfContract: null,
        lengthPercent: 0,
      });
    }
  });

  it("tells a missing value apart from zero", () => {
    const geometry = computeMoneyLineGeometry(CONTRACT, bars(["Missing", null], ["Zero", 0]));

    const [missing, zero] = geometry.bars;
    expect(missing.percentOfContract).toBeNull();
    expect(zero.percentOfContract).toBe(0);
    expect(missing.lengthPercent).toBe(0);
    expect(zero.lengthPercent).toBe(0);
    expect(zero.negative).toBe(false);
  });

  it("keeps a missing value from shrinking the axis the other bars share", () => {
    const geometry = computeMoneyLineGeometry(CONTRACT, bars(["Collected", null], ["Spent", 200_000]));

    expect(geometry.axisMaxPercent).toBe(200);
    expect(geometry.contractPercent).toBe(50);
    expect(geometry.bars[1].lengthPercent).toBe(100);
  });
});

describe("computeMoneyLineGeometry with a fixed axis", () => {
  it("keeps the contract edge on the same x whatever the data", () => {
    const small = computeMoneyLineGeometry(50_000, bars(["Collected", 5_000]), {
      axisMaxPercent: LIST_AXIS_MAX_PERCENT,
    });
    const huge = computeMoneyLineGeometry(900_000, bars(["Collected", 3_000_000]), {
      axisMaxPercent: LIST_AXIS_MAX_PERCENT,
    });

    expect(small.contractPercent).toBe(huge.contractPercent);
    expect(small.axisMaxPercent).toBe(LIST_AXIS_MAX_PERCENT);
    expect(huge.axisMaxPercent).toBe(LIST_AXIS_MAX_PERCENT);
  });

  it("clips a bar past the axis and still reports its true share", () => {
    const geometry = computeMoneyLineGeometry(100_000, bars(["Over", 400_000], ["Fits", 50_000]), {
      axisMaxPercent: LIST_AXIS_MAX_PERCENT,
    });

    const [over, fits] = geometry.bars;
    expect(over).toMatchObject({ percentOfContract: 400, lengthPercent: 100, clipped: true });
    expect(fits.clipped).toBe(false);
  });

  it("does not clip anything on the elastic axis", () => {
    const geometry = computeMoneyLineGeometry(CONTRACT, bars(["Over", 400_000]));

    expect(geometry.axisMaxPercent).toBe(400);
    expect(geometry.bars[0].clipped).toBe(false);
  });
});
