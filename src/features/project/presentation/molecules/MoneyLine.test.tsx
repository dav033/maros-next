import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MoneyLine } from "./MoneyLine";
import { LIST_AXIS_MAX_PERCENT } from "./moneyLineGeometry";

afterEach(cleanup);

function barStyle(name: RegExp): CSSStyleDeclaration {
  return screen.getByRole("progressbar", { name }).style;
}

describe("MoneyLine", () => {
  it("reports the real share of the contract on an overrun", () => {
    render(<MoneyLine estimate={100_000} collected={60_000} spent={128_000} label="Kitchen" />);

    const spent = screen.getByRole("progressbar", { name: /spent/i });
    expect(spent).toHaveAttribute("aria-valuenow", "128");
    expect(spent.title).toContain("128% of contract");
  });

  it("renders no bar and a dash when the data is missing", () => {
    render(<MoneyLine estimate={null} collected={null} spent={null} />);

    expect(screen.queryAllByRole("progressbar")).toHaveLength(0);
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("only paints an overrun as alarm when the money is going out", () => {
    render(<MoneyLine estimate={100_000} collected={130_000} spent={140_000} backlog={120_000} />);

    // Collecting more than the contract is good news (change orders, released
    // retainage) and must keep its own colour; only the spend lane is an alarm.
    expect(barStyle(/collected/i).backgroundColor).toBe("var(--money-in)");
    expect(barStyle(/backlog/i).backgroundColor).toBe("var(--money-hold)");
    expect(barStyle(/spent/i).backgroundColor).toBe("var(--money-over)");
  });

  it("still paints a negative lane as alarm whatever its kind", () => {
    render(<MoneyLine estimate={100_000} collected={-10_000} spent={20_000} />);

    expect(barStyle(/collected/i).backgroundColor).toBe("var(--money-over)");
  });

  it("puts the contract marker on the same x for every row of a fixed-axis list", () => {
    const { container: small } = render(
      <MoneyLine estimate={50_000} collected={10_000} spent={5_000} axisMaxPercent={LIST_AXIS_MAX_PERCENT} />
    );
    const { container: big } = render(
      <MoneyLine estimate={900_000} collected={800_000} spent={700_000} axisMaxPercent={LIST_AXIS_MAX_PERCENT} />
    );

    const marker = (root: HTMLElement) =>
      (root.querySelector("[data-contract-marker]") as HTMLElement).style.left;
    expect(marker(small)).toBe(marker(big));
  });

  it("marks a bar that runs past the fixed axis instead of rescaling", () => {
    render(
      <MoneyLine
        estimate={100_000}
        collected={60_000}
        spent={400_000}
        axisMaxPercent={LIST_AXIS_MAX_PERCENT}
        label="Kitchen"
      />
    );

    const spent = screen.getByRole("progressbar", { name: /spent/i });
    // Full to the end of the axis, but the figure and the share still tell the truth.
    expect(spent.style.width).toBe("100%");
    expect(spent).toHaveAttribute("aria-valuenow", "400");
    expect(spent).toHaveAttribute("aria-valuemax", "400");
    expect(spent.title).toContain("400% of contract");
    expect(spent.parentElement?.querySelector("[data-clipped]")).not.toBeNull();
    expect(screen.getByText("$400,000.00")).toBeInTheDocument();
  });

  it("prints the lane label next to each amount", () => {
    render(<MoneyLine estimate={100_000} collected={60_000} spent={20_000} />);

    expect(screen.getByText("Collected")).toBeInTheDocument();
    expect(screen.getByText("Spent")).toBeInTheDocument();
  });

  it("says out loud why the track is empty when there is no contract", () => {
    render(<MoneyLine estimate={null} collected={60_000} spent={20_000} />);

    expect(screen.getByText(/no contract amount/i)).toBeInTheDocument();
  });

  it("keeps a sub-1% share from printing as a flat zero", () => {
    render(<MoneyLine estimate={1_000_000} collected={4_000} spent={0} />);

    expect(screen.getByRole("progressbar", { name: /collected/i }).title).toContain(
      "0.4% of contract"
    );
  });
});
